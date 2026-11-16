import 'package:flutter/material.dart';
import '../services/api_service.dart';

class SellCoinsScreen extends StatefulWidget {
  const SellCoinsScreen({super.key});

  @override
  State<SellCoinsScreen> createState() => _SellCoinsScreenState();
}

class _SellCoinsScreenState extends State<SellCoinsScreen> {
  final _amountController = TextEditingController(text: '50');
  final _nameController = TextEditingController();
  final _bankController = TextEditingController();
  final _accController = TextEditingController();
  final _ifscController = TextEditingController();
  bool _loading = false;
  String? _error;
  String? _success;
  Map<String, dynamic>? _rates;

  @override
  void initState() {
    super.initState();
    _loadRates();
  }

  void _loadRates() async {
    final rates = await ApiService.getRates();
    setState(() => _rates = rates);
  }

  void _submitSell() async {
    setState(() {
      _loading = true;
      _error = null;
      _success = null;
    });

    try {
      final coins = _amountController.text.trim();
      final res = await ApiService.submitSellRequest(
        coins,
        _nameController.text.trim(),
        _bankController.text.trim(),
        _accController.text.trim(),
        _ifscController.text.trim().toUpperCase(),
      );

      setState(() {
        _success = 'Withdrawal request submitted! Order ${res['sellOrder']['orderNumber']} queued for bank settlement.';
      });
    } catch (e) {
      setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final sellPrice = _rates?['sellPriceInr'] ?? '100.00';
    final coins = double.tryParse(_amountController.text) ?? 0;
    final totalInr = (coins * (double.tryParse(sellPrice) ?? 100)).toStringAsFixed(2);

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFF),
      appBar: AppBar(
        title: const Text('Sell Coins & Bank Cashout', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header Rate
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFDFE8F5)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('SELLING RATE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                      Text('1 SI = ₹$sellPrice INR', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF10213A))),
                    ],
                  ),
                  const Text('Bank Settlement', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF175CFF))),
                ],
              ),
            ),

            const SizedBox(height: 16),

            if (_error != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.red.shade200)),
                child: Text(_error!, style: TextStyle(color: Colors.red.shade800, fontSize: 12)),
              ),
              const SizedBox(height: 16),
            ],

            if (_success != null) ...[
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.green.shade200)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.check_circle, color: Color(0xFF15803D), size: 18),
                        const SizedBox(width: 8),
                        const Text('Request Accepted', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF15803D))),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(_success!, style: TextStyle(fontSize: 12, color: Colors.green.shade900)),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Amount Input Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFDFE8F5)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('COINS TO SELL (SI)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _amountController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    onChanged: (_) => setState(() {}),
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF10213A)),
                    decoration: InputDecoration(
                      suffixText: 'SI',
                      filled: true,
                      fillColor: const Color(0xFFF7FAFF),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const Border.all(color: Color(0xFFDFE8F5))),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text('Payout to Bank: ₹$totalInr INR', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF15803D))),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Bank Details Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFDFE8F5)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('RECEIVING BANK ACCOUNT', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _nameController,
                    decoration: InputDecoration(
                      labelText: 'Account Holder Name',
                      filled: true,
                      fillColor: const Color(0xFFF7FAFF),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const Border.all(color: Color(0xFFDFE8F5))),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _bankController,
                    decoration: InputDecoration(
                      labelText: 'Bank Name (e.g. HDFC Bank)',
                      filled: true,
                      fillColor: const Color(0xFFF7FAFF),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const Border.all(color: Color(0xFFDFE8F5))),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _accController,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'Account Number',
                      filled: true,
                      fillColor: const Color(0xFFF7FAFF),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const Border.all(color: Color(0xFFDFE8F5))),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _ifscController,
                    textCapitalization: TextCapitalization.characters,
                    decoration: InputDecoration(
                      labelText: 'IFSC Code (11 characters)',
                      filled: true,
                      fillColor: const Color(0xFFF7FAFF),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const Border.all(color: Color(0xFFDFE8F5))),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: _loading || coins <= 0 ? null : _submitSell,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF175CFF),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: _loading
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text('Request Payout for ₹$totalInr', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}

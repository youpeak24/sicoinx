import 'package:flutter/material.dart';
import '../services/api_service.dart';

class TransferScreen extends StatefulWidget {
  const TransferScreen({super.key});

  @override
  State<TransferScreen> createState() => _TransferScreenState();
}

class _TransferScreenState extends State<TransferScreen> {
  String _destinationType = 'INTERNAL_USER';
  String _destinationApp = 'YOUPEAK';
  final _recipientController = TextEditingController();
  final _amountController = TextEditingController(text: '10');
  final _noteController = TextEditingController();
  bool _loading = false;
  String? _error;
  String? _success;

  void _handleTransfer() async {
    setState(() {
      _loading = true;
      _error = null;
      _success = null;
    });

    try {
      final res = await ApiService.executeTransfer(
        _destinationType,
        _destinationType == 'ECOSYSTEM_APP' ? _destinationApp : null,
        _recipientController.text.trim(),
        _amountController.text.trim(),
        _noteController.text.trim(),
      );

      setState(() {
        _success = 'Transferred ${_amountController.text} SI! Ref: ${res['transfer']['transferNumber']}';
        _recipientController.clear();
        _noteController.clear();
      });
    } catch (e) {
      setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFF),
      appBar: AppBar(
        title: const Text('Ecosystem Transfers', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
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
                child: Row(
                  children: [
                    const Icon(Icons.check_circle, color: Color(0xFF15803D), size: 20),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_success!, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.green.shade900))),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Destination Type Tabs
            Row(
              children: [
                Expanded(
                  child: _buildDestTab('SIcoinX User', 'INTERNAL_USER', Icons.person_outline),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildDestTab('YouPeak Platform', 'ECOSYSTEM_APP', Icons.hub_outlined),
                ),
              ],
            ),

            const SizedBox(height: 16),

            if (_destinationType == 'ECOSYSTEM_APP') ...[
              Row(
                children: [
                  Expanded(
                    child: _buildAppChoice('YouPeak Live', 'YOUPEAK', Icons.radio),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildAppChoice('YouPeak Shop', 'YOUPEAK_ECOMMERCE', Icons.shopping_bag_outlined),
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],

            // Input Form Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFDFE8F5)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _destinationType == 'INTERNAL_USER'
                        ? 'RECIPIENT EMAIL OR WALLET ID'
                        : 'YOUPEAK USERNAME OR EMAIL',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _recipientController,
                    decoration: InputDecoration(
                      hintText: _destinationType == 'INTERNAL_USER' ? 'user@sicoin.org or SICX-...' : 'user@youpeak.live',
                      filled: true,
                      fillColor: const Color(0xFFF7FAFF),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFDFE8F5))),
                    ),
                  ),
                  const SizedBox(height: 16),

                  const Text('COIN AMOUNT (SI)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _amountController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
                    decoration: InputDecoration(
                      suffixText: 'SI',
                      filled: true,
                      fillColor: const Color(0xFFF7FAFF),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFDFE8F5))),
                    ),
                  ),
                  const SizedBox(height: 16),

                  const Text('TRANSFER NOTE (OPTIONAL)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _noteController,
                    decoration: InputDecoration(
                      hintText: 'e.g. Collaboration reward or subscription',
                      filled: true,
                      fillColor: const Color(0xFFF7FAFF),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFDFE8F5))),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: _loading ? null : _handleTransfer,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF175CFF),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: _loading
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Send Coins Instantly', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDestTab(String title, String type, IconData icon) {
    final selected = _destinationType == type;
    return GestureDetector(
      onTap: () => setState(() => _destinationType = type),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFFEDF4FF) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: selected ? const Color(0xFF175CFF) : const Color(0xFFDFE8F5)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 16, color: selected ? const Color(0xFF175CFF) : const Color(0xFF64748B)),
            const SizedBox(width: 6),
            Text(title, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: selected ? const Color(0xFF175CFF) : const Color(0xFF10213A))),
          ],
        ),
      ),
    );
  }

  Widget _buildAppChoice(String title, String app, IconData icon) {
    final selected = _destinationApp == app;
    return GestureDetector(
      onTap: () => setState(() => _destinationApp = app),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: selected ? Colors.white : const Color(0xFFF7FAFF),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: selected ? const Color(0xFF175CFF) : const Color(0xFFDFE8F5)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 14, color: selected ? const Color(0xFF175CFF) : const Color(0xFF64748B)),
            const SizedBox(width: 6),
            Text(title, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: selected ? const Color(0xFF175CFF) : const Color(0xFF64748B))),
          ],
        ),
      ),
    );
  }
}

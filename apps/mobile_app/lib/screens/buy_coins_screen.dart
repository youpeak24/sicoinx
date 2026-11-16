import 'package:flutter/material.dart';
import '../services/api_service.dart';

class BuyCoinsScreen extends StatefulWidget {
  const BuyCoinsScreen({super.key});

  @override
  State<BuyCoinsScreen> createState() => _BuyCoinsScreenState();
}

class _BuyCoinsScreenState extends State<BuyCoinsScreen> {
  final _amountController = TextEditingController(text: '100');
  String _paymentMethod = 'RAZORPAY_UPI';
  bool _loading = false;
  String? _error;
  Map<String, dynamic>? _rates;
  Map<String, dynamic>? _successOrder;

  @override
  void initState() {
    super.initState();
    _loadRates();
  }

  void _loadRates() async {
    final rates = await ApiService.getRates();
    setState(() => _rates = rates);
  }

  void _initiateBuy() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final coins = _amountController.text.trim();
      final orderRes = await ApiService.createBuyOrder(coins, _paymentMethod);

      // Simulate Razorpay payment modal authorization
      if (mounted) {
        _showRazorpayModal(orderRes);
      }
    } catch (e) {
      setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showRazorpayModal(Map<String, dynamic> order) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: const Color(0xFF0C2340), borderRadius: BorderRadius.circular(8)),
                        child: const Text('rzp', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                      const SizedBox(width: 10),
                      const Text('Razorpay Secured', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    ],
                  ),
                  Text('₹${order['totalInr']}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF10213A))),
                ],
              ),
              const SizedBox(height: 16),
              const Text('Select payment simulation to authorize:', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
              const SizedBox(height: 12),
              _buildPayOption('Google Pay / PhonePe (UPI)', Icons.phone_android, () => _completePayment(order, 'pay_upi_${DateTime.now().millisecondsSinceEpoch}')),
              _buildPayOption('Debit / Credit Card', Icons.credit_card, () => _completePayment(order, 'pay_card_${DateTime.now().millisecondsSinceEpoch}')),
              _buildPayOption('Net Banking (All Indian Banks)', Icons.account_balance, () => _completePayment(order, 'pay_nb_${DateTime.now().millisecondsSinceEpoch}')),
              const SizedBox(height: 12),
            ],
          ),
        );
      },
    );
  }

  Widget _buildPayOption(String title, IconData icon, VoidCallback onTap) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        onTap: () {
          Navigator.of(context).pop();
          onTap();
        },
        tileColor: const Color(0xFFF7FAFF),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const Border.all(color: Color(0xFFDFE8F5)),
        ),
        leading: Icon(icon, color: const Color(0xFF175CFF)),
        title: Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
        trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Color(0xFF64748B)),
      ),
    );
  }

  void _completePayment(Map<String, dynamic> order, String paymentId) async {
    setState(() => _loading = true);
    try {
      final verifyRes = await ApiService.verifyPayment(
        order['buyOrderId'],
        order['razorpayOrder']['id'],
        paymentId,
        order['testSignatureHelper'] ?? 'test_sig_verified',
      );

      setState(() => _successOrder = verifyRes);
    } catch (e) {
      setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final buyPrice = _rates?['buyPriceInr'] ?? '105.00';
    final coins = double.tryParse(_amountController.text) ?? 0;
    final totalInr = (coins * (double.tryParse(buyPrice) ?? 105)).toStringAsFixed(2);

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFF),
      appBar: AppBar(
        title: const Text('Buy SIcoinX', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Success Receipt View
            if (_successOrder != null) ...[
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.green.shade200),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.check_circle, color: Color(0xFF15803D), size: 48),
                    const SizedBox(height: 10),
                    const Text('Coins Credited to Wallet!', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF10213A))),
                    const SizedBox(height: 4),
                    const Text('Official Razorpay Transaction Receipt', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                    const Divider(height: 24),
                    _receiptRow('Receipt No:', _successOrder?['receipt']?['receiptNumber'] ?? 'REC-BUY-100'),
                    _receiptRow('Order No:', _successOrder?['receipt']?['orderNumber'] ?? 'ORD-BUY-100'),
                    _receiptRow('Coins Credited:', '+${_successOrder?['receipt']?['coinAmount']} SI', isBold: true),
                    _receiptRow('Total INR Paid:', '₹${_successOrder?['receipt']?['totalInr']}', isBold: true),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF175CFF), foregroundColor: Colors.white),
                      child: const Text('Done & Return to Wallet'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ] else ...[
              // Live Rate Strip
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFEDF4FF),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFDFE8F5)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('BUYING RATE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                        Text('1 SI = ₹$buyPrice INR', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF10213A))),
                      ],
                    ),
                    const Text('Instant Credit', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF15803D))),
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

              // Coin Calculator Card
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
                    const Text('ENTER COINS TO PURCHASE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _amountController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      onChanged: (_) => setState(() {}),
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF10213A)),
                      decoration: InputDecoration(
                        suffixText: 'SI',
                        suffixStyle: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                        filled: true,
                        fillColor: const Color(0xFFF7FAFF),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const Border.all(color: Color(0xFFDFE8F5))),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total INR to Pay:', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                        Text('₹$totalInr INR', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF175CFF))),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Payment Method Choices
              const Text('PAYMENT GATEWAY', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
              const SizedBox(height: 8),
              _buildMethodSelector('UPI (Google Pay, PhonePe, Paytm)', 'RAZORPAY_UPI', Icons.smartphone),
              _buildMethodSelector('Debit / Credit Cards', 'RAZORPAY_CARD', Icons.credit_card),
              _buildMethodSelector('Net Banking (All Indian Banks)', 'RAZORPAY_NETBANKING', Icons.account_balance),

              const SizedBox(height: 24),

              ElevatedButton(
                onPressed: _loading || coins <= 0 ? null : _initiateBuy,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF175CFF),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: _loading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text('Pay ₹$totalInr with Razorpay', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildMethodSelector(String title, String method, IconData icon) {
    final selected = _paymentMethod == method;
    return GestureDetector(
      onTap: () => setState(() => _paymentMethod = method),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFFEDF4FF) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: selected ? const Color(0xFF175CFF) : const Color(0xFFDFE8F5)),
        ),
        child: Row(
          children: [
            Icon(icon, color: selected ? const Color(0xFF175CFF) : const Color(0xFF64748B), size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(title, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: selected ? const Color(0xFF175CFF) : const Color(0xFF10213A))),
            ),
            if (selected) const Icon(Icons.check_circle, color: Color(0xFF175CFF), size: 18),
          ],
        ),
      ),
    );
  }

  Widget _receiptRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
          Text(value, style: TextStyle(fontSize: 12, fontWeight: isBold ? FontWeight.bold : FontWeight.w600, color: const Color(0xFF10213A))),
        ],
      ),
    );
  }
}

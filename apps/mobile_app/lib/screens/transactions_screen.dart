import 'package:flutter/material.dart';
import '../services/api_service.dart';

class TransactionsScreen extends StatefulWidget {
  const TransactionsScreen({super.key});

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  List<dynamic> _transactions = [];
  bool _loading = true;
  String _selectedFilter = 'ALL';

  @override
  void initState() {
    super.initState();
    _loadTransactions();
  }

  void _loadTransactions() async {
    setState(() => _loading = true);
    try {
      final txs = await ApiService.getTransactions(_selectedFilter);
      setState(() => _transactions = txs);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showReceipt(dynamic tx) {
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
                  const Text('Transaction Receipt', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF10213A))),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(10)),
                    child: Text(tx['status'] ?? 'CONFIRMED', style: const TextStyle(color: Color(0xFF15803D), fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              const Divider(height: 24),
              _row('Tx Hash:', '${(tx['txHash'] ?? '0x...').toString().substring(0, 14)}...'),
              _row('Type:', tx['type'] ?? 'RECORD'),
              _row('Coins Transacted:', '${tx['coinAmount']} SI', isBold: true),
              _row('Balance After:', '${tx['balanceAfter']} SI'),
              _row('Description:', tx['description'] ?? 'Ecosystem movement'),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF175CFF), foregroundColor: Colors.white),
                child: const Text('Close'),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _row(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
          Text(value, style: TextStyle(fontSize: 12, fontWeight: isBold ? FontWeight.bold : FontWeight.w600, color: const Color(0xFF10213A))),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Filter pills
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              _filterPill('All', 'ALL'),
              _filterPill('Purchases', 'BUY_COIN'),
              _filterPill('Sales', 'SELL_COIN'),
              _filterPill('Transfers', 'TRANSFER_OUT'),
              _filterPill('YouPeak', 'ECOSYSTEM_DEBIT'),
            ],
          ),
        ),

        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF175CFF)))
              : _transactions.isEmpty
                  ? const Center(child: Text('No transactions found in this view.', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)))
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: _transactions.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 8),
                      itemBuilder: (context, i) {
                        final tx = _transactions[i];
                        final isPositive = (tx['coinAmount'] ?? '').toString().startsWith('+');
                        return InkWell(
                          onTap: () => _showReceipt(tx),
                          borderRadius: BorderRadius.circular(16),
                          child: Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFFDFE8F5)),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: isPositive ? Colors.green.shade50 : const Color(0xFFEDF4FF),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Icon(
                                    isPositive ? Icons.add : Icons.remove,
                                    size: 16,
                                    color: isPositive ? const Color(0xFF15803D) : const Color(0xFF175CFF),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        tx['description'] ?? 'Transaction',
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF10213A)),
                                      ),
                                      Text(
                                        tx['type'] ?? 'RECORD',
                                        style: const TextStyle(fontSize: 10, color: Color(0xFF64748B)),
                                      ),
                                    ],
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      '${tx['coinAmount']} SI',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w900,
                                        fontSize: 13,
                                        color: isPositive ? const Color(0xFF15803D) : const Color(0xFF10213A),
                                      ),
                                    ),
                                    const Text('View Receipt', style: TextStyle(fontSize: 10, color: Color(0xFF175CFF), fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
        ),
      ],
    );
  }

  Widget _filterPill(String title, String value) {
    final selected = _selectedFilter == value;
    return GestureDetector(
      onTap: () {
        setState(() => _selectedFilter = value);
        _loadTransactions();
      },
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFF175CFF) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: selected ? const Color(0xFF175CFF) : const Color(0xFFDFE8F5)),
        ),
        child: Text(
          title,
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: selected ? Colors.white : const Color(0xFF64748B)),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../services/api_service.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  List<dynamic> _tickets = [];
  bool _loading = true;
  final _subjectController = TextEditingController();
  final _messageController = TextEditingController();
  String _category = 'Wallet & Trading';
  bool _creating = false;

  @override
  void initState() {
    super.initState();
    _loadTickets();
  }

  void _loadTickets() async {
    setState(() => _loading = true);
    try {
      final tickets = await ApiService.getSupportTickets();
      setState(() => _tickets = tickets);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _openCreateTicketModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
            left: 20,
            right: 20,
            top: 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Submit Support Inquiry', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 16),
              TextField(
                controller: _subjectController,
                decoration: InputDecoration(
                  labelText: 'Subject',
                  filled: true,
                  fillColor: const Color(0xFFF7FAFF),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: _category,
                items: const [
                  DropdownMenuItem(value: 'Wallet & Trading', child: Text('Wallet & Trading')),
                  DropdownMenuItem(value: 'Razorpay Payment', child: Text('Razorpay Payment')),
                  DropdownMenuItem(value: 'KYC Identity Compliance', child: Text('KYC Identity Compliance')),
                  DropdownMenuItem(value: 'YouPeak Platform Integration', child: Text('YouPeak Platform Integration')),
                ],
                onChanged: (val) => setState(() => _category = val!),
                decoration: InputDecoration(
                  labelText: 'Category',
                  filled: true,
                  fillColor: const Color(0xFFF7FAFF),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _messageController,
                maxLines: 3,
                decoration: InputDecoration(
                  labelText: 'Explain your question or issue...',
                  filled: true,
                  fillColor: const Color(0xFFF7FAFF),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () async {
                  if (_subjectController.text.isEmpty || _messageController.text.isEmpty) return;
                  Navigator.of(ctx).pop();
                  setState(() => _creating = true);
                  try {
                    await ApiService.createSupportTicket(
                      _subjectController.text.trim(),
                      _category,
                      _messageController.text.trim(),
                    );
                    _subjectController.clear();
                    _messageController.clear();
                    _loadTickets();
                  } catch (_) {}
                  setState(() => _creating = false);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF175CFF),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _creating
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Submit Ticket'),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFF),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF175CFF)))
          : _tickets.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.headset_mic_outlined, size: 48, color: Color(0xFF64748B)),
                      const SizedBox(height: 12),
                      const Text('No support inquiries open.', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF10213A))),
                      const SizedBox(height: 4),
                      const Text('Need assistance with your wallet or payments?', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _openCreateTicketModal,
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF175CFF), foregroundColor: Colors.white),
                        child: const Text('Create New Ticket'),
                      ),
                    ],
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _tickets.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 10),
                  itemBuilder: (context, i) {
                    final t = _tickets[i];
                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFDFE8F5)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(t['category'] ?? 'General', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF175CFF))),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.blue.shade50,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(t['status'] ?? 'OPEN', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF175CFF))),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(t['subject'] ?? 'Ticket', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF10213A))),
                          const SizedBox(height: 6),
                          Text('${t['messagesCount'] ?? 1} message(s) recorded', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                        ],
                      ),
                    );
                  },
                ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openCreateTicketModal,
        backgroundColor: const Color(0xFF175CFF),
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_comment_outlined, size: 18),
        label: const Text('New Ticket', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
      ),
    );
  }
}

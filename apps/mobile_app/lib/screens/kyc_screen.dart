import 'package:flutter/material.dart';
import '../services/api_service.dart';

class KycScreen extends StatefulWidget {
  const KycScreen({super.key});

  @override
  State<KycScreen> createState() => _KycScreenState();
}

class _KycScreenState extends State<KycScreen> {
  final _nameController = TextEditingController();
  final _idNumberController = TextEditingController();
  String _idType = 'AADHAAR';
  bool _loading = true;
  bool _submitting = false;
  String? _error;
  String? _success;
  Map<String, dynamic>? _kycData;

  @override
  void initState() {
    super.initState();
    _loadKyc();
  }

  void _loadKyc() async {
    setState(() => _loading = true);
    try {
      final kyc = await ApiService.getKycStatus();
      setState(() {
        _kycData = kyc;
        if (kyc['fullName'] != null) {
          _nameController.text = kyc['fullName'];
          _idNumberController.text = kyc['idNumber'] ?? '';
          _idType = kyc['idType'] ?? 'AADHAAR';
        }
      });
    } catch (_) {
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _submitKyc() async {
    setState(() {
      _submitting = true;
      _error = null;
      _success = null;
    });

    try {
      final res = await ApiService.submitKyc(
        _nameController.text.trim(),
        _idType,
        _idNumberController.text.trim(),
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600',
      );

      setState(() {
        _kycData = res;
        _success = 'Identity verification submitted! Review turnaround is 1-24 hours.';
      });
    } catch (e) {
      setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF175CFF)));
    }

    final status = _kycData?['status'] ?? 'NOT_SUBMITTED';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Status Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: status == 'APPROVED'
                  ? Colors.green.shade50
                  : status == 'PENDING'
                      ? Colors.amber.shade50
                      : Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: status == 'APPROVED'
                    ? Colors.green.shade200
                    : status == 'PENDING'
                        ? Colors.amber.shade200
                        : const Color(0xFFDFE8F5),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  status == 'APPROVED'
                      ? Icons.check_circle
                      : status == 'PENDING'
                          ? Icons.access_time
                          : Icons.shield_outlined,
                  color: status == 'APPROVED'
                      ? Colors.green.shade700
                      : status == 'PENDING'
                          ? Colors.amber.shade800
                          : const Color(0xFF175CFF),
                  size: 28,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        status == 'APPROVED'
                            ? 'Identity Verified (KYC Level 2)'
                            : status == 'PENDING'
                                ? 'Verification Under Review'
                                : 'KYC Verification Required',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                          color: status == 'APPROVED'
                              ? Colors.green.shade900
                              : status == 'PENDING'
                                  ? Colors.amber.shade900
                                  : const Color(0xFF10213A),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        status == 'APPROVED'
                            ? 'Full withdrawal limits and cross-ecosystem spending unlocked.'
                            : status == 'PENDING'
                                ? 'Documents received. Approval takes 1-24 hours.'
                                : 'Complete identity verification to unlock bank cashouts.',
                        style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

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
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.green.shade200)),
              child: Text(_success!, style: TextStyle(color: Colors.green.shade900, fontSize: 12)),
            ),
            const SizedBox(height: 16),
          ],

          if (status != 'APPROVED') ...[
            // Form Card
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
                  const Text('GOVERNMENT ID DETAILS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _nameController,
                    decoration: InputDecoration(
                      labelText: 'Full Name as on ID',
                      filled: true,
                      fillColor: const Color(0xFFF7FAFF),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const Border.all(color: Color(0xFFDFE8F5))),
                    ),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: _idType,
                    items: const [
                      DropdownMenuItem(value: 'AADHAAR', child: Text('Aadhaar Card (India)')),
                      DropdownMenuItem(value: 'PAN', child: Text('PAN Card (India)')),
                      DropdownMenuItem(value: 'PASSPORT', child: Text('Passport (International)')),
                      DropdownMenuItem(value: 'DRIVING_LICENSE', child: Text('Driving License')),
                    ],
                    onChanged: (val) => setState(() => _idType = val!),
                    decoration: InputDecoration(
                      labelText: 'ID Type',
                      filled: true,
                      fillColor: const Color(0xFFF7FAFF),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const Border.all(color: Color(0xFFDFE8F5))),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _idNumberController,
                    decoration: InputDecoration(
                      labelText: 'Document ID Number',
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
              onPressed: _submitting ? null : _submitKyc,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF175CFF),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: _submitting
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Submit KYC Verification', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            ),
          ],
        ],
      ),
    );
  }
}

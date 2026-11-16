import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'buy_coins_screen.dart';
import 'sell_coins_screen.dart';
import 'transfer_screen.dart';
import 'kyc_screen.dart';
import 'transactions_screen.dart';
import 'support_screen.dart';
import 'login_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;
  Map<String, dynamic>? _walletData;
  List<dynamic> _recentTransactions = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() async {
    setState(() => _loading = true);
    try {
      final wallet = await ApiService.getWallet();
      final txs = await ApiService.getTransactions('ALL');
      setState(() {
        _walletData = wallet;
        _recentTransactions = txs.take(5).toList();
      });
    } catch (e) {
      debugPrint('Error loading dashboard: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      _buildHomeView(),
      const TransactionsScreen(),
      const KycScreen(),
      const SupportScreen(),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFF),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: const Color(0xFF175CFF),
                borderRadius: BorderRadius.circular(8),
              ),
              alignment: Alignment.center,
              child: const Text('SI', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
            ),
            const SizedBox(width: 8),
            const Text(
              'SIcoinX',
              style: TextStyle(color: Color(0xFF10213A), fontWeight: FontWeight.w800, fontSize: 18),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF175CFF)),
            onPressed: _loadData,
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Color(0xFF64748B)),
            onPressed: () async {
              await ApiService.clearAuth();
              if (mounted) {
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              }
            },
          ),
        ],
      ),
      body: screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF175CFF),
        unselectedItemColor: const Color(0xFF64748B),
        selectedFontSize: 11,
        unselectedFontSize: 11,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.account_balance_wallet_outlined), label: 'Wallet'),
          BottomNavigationBarItem(icon: Icon(Icons.receipt_long_outlined), label: 'History'),
          BottomNavigationBarItem(icon: Icon(Icons.verified_user_outlined), label: 'KYC'),
          BottomNavigationBarItem(icon: Icon(Icons.headset_mic_outlined), label: 'Support'),
        ],
      ),
    );
  }

  Widget _buildHomeView() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF175CFF)));
    }

    final wallet = _walletData?['wallet'] ?? {};
    final rates = _walletData?['rates'] ?? {};
    final valuation = _walletData?['valuation'] ?? {};
    final kycStatus = _walletData?['kycStatus'] ?? 'NOT_SUBMITTED';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. Digital Coin Wallet Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF123B9A), Color(0xFF175CFF)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF175CFF).withOpacity(0.3),
                  blurRadius: 18,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    const Text('SIcoinX DIGITAL WALLET', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        kycStatus == 'APPROVED' ? 'KYC VERIFIED' : 'KYC PENDING',
                        style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  wallet['address'] ?? 'SICX-XXXX-XXXX-XXXX',
                  style: const TextStyle(color: Colors.white, fontFamily: 'monospace', fontSize: 12, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      '${wallet['coinBalance'] ?? '0.00'}',
                      style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900),
                    ),
                    const SizedBox(width: 6),
                    const Text('SI', style: TextStyle(color: Colors.white70, fontSize: 16, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '≈ ₹${valuation['inr'] ?? '0.00'} INR  (\$${valuation['usd'] ?? '0.00'} USD)',
                  style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // 2. Reference Rate Ticker Strip
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFDFE8F5)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.trending_up, color: Color(0xFF15803D), size: 18),
                    const SizedBox(width: 8),
                    Text(
                      'Buy: ₹${rates['buyPriceInr'] ?? '105.00'}',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF10213A)),
                    ),
                  ],
                ),
                Container(width: 1, height: 16, color: const Color(0xFFDFE8F5)),
                Text(
                  'Sell: ₹${rates['sellPriceInr'] ?? '100.00'}',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF10213A)),
                ),
                Container(width: 1, height: 16, color: const Color(0xFFDFE8F5)),
                const Text(
                  'Live',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF15803D)),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // 3. Quick Action Buttons
          Row(
            children: [
              Expanded(
                child: _buildActionButton(
                  icon: Icons.add_shopping_cart,
                  label: 'Buy Coins',
                  color: const Color(0xFF175CFF),
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const BuyCoinsScreen()),
                    ).then((_) => _loadData());
                  },
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildActionButton(
                  icon: Icons.account_balance,
                  label: 'Sell to Bank',
                  color: const Color(0xFF123B9A),
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const SellCoinsScreen()),
                    ).then((_) => _loadData());
                  },
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildActionButton(
                  icon: Icons.send_rounded,
                  label: 'Transfer',
                  color: const Color(0xFF38BDF8),
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const TransferScreen()),
                    ).then((_) => _loadData());
                  },
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // 4. YouPeak Ecosystem Promo Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFEDF4FF),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFDFE8F5)),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: const Color(0xFF175CFF),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.hub_outlined, color: Colors.white, size: 22),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Connected Ecosystem',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF10213A)),
                      ),
                      Text(
                        'Spend SIcoinX directly across YouPeak Streaming & YouPeak E-Commerce checkout.',
                        style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // 5. Recent Transactions Header
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              const Text('Recent Ledger Transactions', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF10213A))),
              TextButton(
                onPressed: () => setState(() => _currentIndex = 1),
                child: const Text('View All', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF175CFF))),
              ),
            ],
          ),

          // Recent Transactions List
          if (_recentTransactions.isEmpty)
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFDFE8F5)),
              ),
              child: const Text('No transactions recorded yet.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _recentTransactions.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, i) {
                final tx = _recentTransactions[i];
                final isPositive = (tx['coinAmount'] ?? '').toString().startsWith('+');
                return Container(
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
                          color: isPositive ? Colors.green.shade50 : Colors.blue.shade50,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          isPositive ? Icons.arrow_downward : Icons.arrow_upward,
                          size: 16,
                          color: isPositive ? Colors.green.shade700 : const Color(0xFF175CFF),
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
                              style: const TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        '${tx['coinAmount']} SI',
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 13,
                          color: isPositive ? const Color(0xFF15803D) : const Color(0xFF10213A),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFDFE8F5)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 6),
            Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF10213A))),
          ],
        ),
      ),
    );
  }
}

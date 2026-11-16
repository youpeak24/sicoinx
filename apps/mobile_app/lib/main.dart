import 'package:flutter/material.dart';
import 'screens/login_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SicoinXApp());
}

class SicoinXApp extends StatelessWidget {
  const SicoinXApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SIcoinX',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFFF7FAFF),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF175CFF),
          primary: const Color(0xFF175CFF),
          surface: Colors.white,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Color(0xFF10213A),
          elevation: 0.5,
          centerTitle: false,
        ),
        fontFamily: 'sans-serif',
        useMaterial3: true,
      ),
      home: const LoginScreen(),
    );
  }
}

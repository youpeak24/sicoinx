import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/main.dart';

void main() {
  testWidgets('SIcoinX customer app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const SicoinXApp());
    expect(find.text('SIcoinX Customer App'), findsOneWidget);
  });
}

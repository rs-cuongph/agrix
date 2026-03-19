import 'package:flutter/material.dart';
import '../../core/theme.dart';

/// "Hỏi Ngay" button for product detail screen — opens AI chat
class AskAIButton extends StatelessWidget {
  final String? productId;
  final String? productName;

  const AskAIButton({super.key, this.productId, this.productName});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => _AIChatScreen(
              productId: productId,
              productName: productName,
            ),
          ),
        );
      },
      icon: const Icon(Icons.smart_toy, size: 18),
      label: const Text('Hỏi Ngay'),
      style: ElevatedButton.styleFrom(
        backgroundColor: AgrixColors.secondary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      ),
    );
  }
}

class _AIChatScreen extends StatefulWidget {
  final String? productId;
  final String? productName;
  const _AIChatScreen({this.productId, this.productName});

  @override
  State<_AIChatScreen> createState() => _AIChatScreenState();
}

class _AIChatScreenState extends State<_AIChatScreen> {
  final _messageController = TextEditingController();
  final List<Map<String, String>> _messages = [];
  bool _isTyping = false;

  @override
  void initState() {
    super.initState();
    if (widget.productName != null) {
      _messages.add({
        'role': 'system',
        'content': '🤖 Chào bạn! Tôi có thể giúp bạn với thông tin về "${widget.productName}". Hãy hỏi bất cứ điều gì!',
      });
    } else {
      _messages.add({
        'role': 'system',
        'content': '🤖 Chào bạn! Tôi là trợ lý nông nghiệp Agrix. Hỏi tôi về cách sử dụng thuốc, phân bón, hoặc bất kỳ vấn đề nông nghiệp nào!',
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.productName != null ? '🤖 Hỏi về ${widget.productName}' : '🤖 Hỏi Ngay'),
        backgroundColor: AgrixColors.secondary,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg['role'] == 'user';
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                    decoration: BoxDecoration(
                      color: isUser ? AgrixColors.primary : Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      msg['content'] ?? '',
                      style: TextStyle(color: isUser ? Colors.white : AgrixColors.textPrimary),
                    ),
                  ),
                );
              },
            ),
          ),
          if (_isTyping)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Row(
                children: [
                  SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: AgrixColors.secondary)),
                  const SizedBox(width: 8),
                  Text('Đang suy nghĩ...', style: TextStyle(color: AgrixColors.textSecondary, fontSize: 13)),
                ],
              ),
            ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, -1))],
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: const InputDecoration(
                      hintText: 'Nhập câu hỏi...',
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _sendMessage,
                  icon: const Icon(Icons.send),
                  style: IconButton.styleFrom(backgroundColor: AgrixColors.secondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({'role': 'user', 'content': text});
      _isTyping = true;
    });
    _messageController.clear();

    // TODO: Call API to get AI response
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        setState(() {
          _messages.add({'role': 'assistant', 'content': '[Demo] Cảm ơn câu hỏi! Tính năng AI sẽ hoạt động khi cấu hình OPENAI_API_KEY.'});
          _isTyping = false;
        });
      }
    });
  }
}

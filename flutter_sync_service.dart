import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as IO;

/// Classe responsável pela sincronização de tempo e eventos de áudio.
/// Implementa lógica de NTP simplificada para calcular o offset do relógio.
class SyncService {
  late IO.Socket socket;
  int _serverClockOffset = 0; // Diferença em ms: ServerTime - LocalTime
  
  // Streams para a UI/Player reagirem
  final _syncPlayController = StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get onSyncPlay => _syncPlayController.stream;

  void connect(String serverUrl, String roomId, String userId) {
    socket = IO.io(serverUrl, IO.OptionBuilder()
      .setTransports(['websocket'])
      .enableAutoConnect()
      .build());

    socket.onConnect((_) {
      print('Conectado ao servidor Sync Beats');
      _calculateClockOffset();
      
      // Entrar na sala
      socket.emit('join_room', {
        'roomId': roomId,
        'userId': userId,
        'userName': 'User_$userId',
      });
    });

    // Escutar eventos de sincronização
    socket.on('sync_play', (data) {
      final int startTime = data['startTime'];
      final int seekPosition = data['seekPosition'];
      
      final int targetPosition = calculateCurrentPosition(startTime, seekPosition);
      
      _syncPlayController.add({
        'trackId': data['trackId'],
        'positionMs': targetPosition,
        'status': 'playing',
      });
    });

    socket.on('sync_pause', (data) {
      _syncPlayController.add({
        'positionMs': data['seekPosition'],
        'status': 'paused',
      });
    });
  }

  /// Calcula o offset entre o relógio local e o servidor.
  /// Usa técnica de RTT (Round Trip Time) para maior precisão.
  void _calculateClockOffset() {
    int t1 = DateTime.now().millisecondsSinceEpoch;
    
    socket.emitWithAck('request_time', t1, ack: (data) {
      int t4 = DateTime.now().millisecondsSinceEpoch;
      int t2 = data['serverTime']; // Tempo no servidor quando recebeu
      int t3 = data['serverTime']; // Tempo no servidor quando enviou (simplificado)
      
      // RTT = (t4 - t1)
      // Offset = ((t2 - t1) + (t3 - t4)) / 2
      int rtt = t4 - t1;
      _serverClockOffset = ((t2 - t1) + (t2 - t4)) ~/ 2;
      
      print('Clock Sync Completo. RTT: ${rtt}ms, Offset: ${_serverClockOffset}ms');
    });
  }

  /// Determina o ponto exato da música baseado no tempo decorrido desde o 'startTime' do servidor.
  int calculateCurrentPosition(int serverStartTime, int seekPositionAtStart) {
    int localNow = DateTime.now().millisecondsSinceEpoch;
    int serverNow = localNow + _serverClockOffset;
    
    int timeElapsedSinceStart = serverNow - serverStartTime;
    
    // A posição atual é o seek inicial + tempo que passou desde o comando de play
    return seekPositionAtStart + timeElapsedSinceStart;
  }

  void dispose() {
    socket.dispose();
    _syncPlayController.close();
  }
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Clock, 
  Target, 
  Trophy, 
  Calendar,
  Send,
  BellOff,
  Shield,
  CheckCircle
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export const NotificationSettings = () => {
  const {
    preferences,
    devices,
    loading,
    pushSupported,
    pushPermission,
    updatePreferences,
    enablePushNotifications,
    disablePushNotifications,
    sendTestNotification,
  } = useNotifications();

  if (!preferences) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Configurações de Notificação
          </CardTitle>
          <CardDescription>
            Escolha como e quando você quer receber notificações do Daily Talk Boost.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label className="text-base font-medium">
                    Notificações por Email
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba lembretes e atualizações por email
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.email_enabled}
                onCheckedChange={(checked) => 
                  updatePreferences({ email_enabled: checked })
                }
                disabled={loading}
              />
            </div>
          </div>

          <Separator />

          {/* Push Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label className="text-base font-medium">
                    Notificações Push
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações instantâneas no navegador
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!pushSupported && (
                  <Badge variant="secondary">Não suportado</Badge>
                )}
                {pushSupported && pushPermission === 'denied' && (
                  <Badge variant="destructive">Bloqueado</Badge>
                )}
                {pushSupported && pushPermission === 'granted' && preferences.push_enabled && (
                  <Badge variant="default">Ativo</Badge>
                )}
                <Switch
                  checked={preferences.push_enabled}
                  onCheckedChange={async (checked) => {
                    if (checked) {
                      await enablePushNotifications();
                    } else {
                      await disablePushNotifications();
                    }
                  }}
                  disabled={loading || !pushSupported}
                />
              </div>
            </div>

            {/* Dispositivos Registrados */}
            {devices.length > 0 && (
              <div className="ml-8 space-y-2">
                <Label className="text-sm font-medium">Dispositivos registrados:</Label>
                {devices.map((device) => (
                  <div key={device.id} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">
                      {device.device_name || 'Dispositivo'} - {new Date(device.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {pushSupported && pushPermission === 'denied' && (
              <div className="ml-8 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-yellow-800">
                  <Shield className="w-4 h-4" />
                  <span>
                    Notificações bloqueadas. Clique no ícone de cadeado na barra de endereços para permitir.
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Notificação</CardTitle>
          <CardDescription>
            Escolha quais tipos de notificação você deseja receber.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lembretes de Lições */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <Label className="text-base font-medium">
                  Lembretes de Lições
                </Label>
                <p className="text-sm text-muted-foreground">
                  Lembretes diários para praticar suas lições
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.lesson_reminders}
              onCheckedChange={(checked) => 
                updatePreferences({ lesson_reminders: checked })
              }
              disabled={loading}
            />
          </div>

          {/* Lembretes de Sequência */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-orange-500" />
              <div>
                <Label className="text-base font-medium">
                  Lembretes de Sequência
                </Label>
                <p className="text-sm text-muted-foreground">
                  Avisos quando sua sequência de estudos estiver em risco
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.streak_reminders}
              onCheckedChange={(checked) => 
                updatePreferences({ streak_reminders: checked })
              }
              disabled={loading}
            />
          </div>

          {/* Conquistas */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <Label className="text-base font-medium">
                  Conquistas
                </Label>
                <p className="text-sm text-muted-foreground">
                  Celebre suas conquistas e marcos importantes
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.achievement_notifications}
              onCheckedChange={(checked) => 
                updatePreferences({ achievement_notifications: checked })
              }
              disabled={loading}
            />
          </div>

          {/* Meta Diária */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-green-500" />
              <div>
                <Label className="text-base font-medium">
                  Meta Diária
                </Label>
                <p className="text-sm text-muted-foreground">
                  Lembretes sobre sua meta diária de estudos
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.daily_goal_reminders}
              onCheckedChange={(checked) => 
                updatePreferences({ daily_goal_reminders: checked })
              }
              disabled={loading}
            />
          </div>

          {/* Resumo Semanal */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <Label className="text-base font-medium">
                  Resumo Semanal
                </Label>
                <p className="text-sm text-muted-foreground">
                  Relatório semanal do seu progresso nos estudos
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.weekly_summary}
              onCheckedChange={(checked) => 
                updatePreferences({ weekly_summary: checked })
              }
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Teste suas Configurações</CardTitle>
          <CardDescription>
            Teste se suas notificações estão funcionando corretamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button
            onClick={sendTestNotification}
            disabled={loading || (!preferences.email_enabled && !preferences.push_enabled)}
            className="flex-1"
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar Teste
          </Button>
          
          {preferences.push_enabled && (
            <Button
              variant="outline"
              onClick={disablePushNotifications}
              disabled={loading}
            >
              <BellOff className="w-4 h-4 mr-2" />
              Desativar Push
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
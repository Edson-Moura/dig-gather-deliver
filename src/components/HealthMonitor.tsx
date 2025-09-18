import React from 'react';
import { useErrorMonitoring } from '@/hooks/useErrorMonitoring';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export const HealthMonitor: React.FC = () => {
  const { errorStats, isMonitoring, resetStats, healthStatus } = useErrorMonitoring();

  if (!import.meta.env.DEV || !isMonitoring) {
    return null;
  }

  const getStatusIcon = () => {
    switch (healthStatus) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (healthStatus) {
      case 'healthy':
        return 'bg-success text-success-foreground';
      case 'warning':
        return 'bg-warning text-warning-foreground';
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-64 shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">System Health</span>
            </div>
            <Badge className={getStatusColor()}>
              {healthStatus.toUpperCase()}
            </Badge>
          </div>
          
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Total Errors:</span>
              <span>{errorStats.totalErrors}</span>
            </div>
            <div className="flex justify-between">
              <span>Critical:</span>
              <span>{errorStats.criticalErrors}</span>
            </div>
            <div className="flex justify-between">
              <span>Error Rate:</span>
              <span>{errorStats.errorRate.toFixed(1)}/min</span>
            </div>
            {errorStats.lastError && (
              <div className="flex justify-between">
                <span>Last Error:</span>
                <span>{errorStats.lastError.toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          <Button
            onClick={resetStats}
            variant="outline"
            size="sm"
            className="w-full mt-2"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
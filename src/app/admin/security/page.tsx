'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { 
  Shield, 
  AlertTriangle, 
  UserCheck, 
  Lock, 
  Eye, 
  EyeOff,
  Activity,
  Clock,
  Users,
  Key
} from 'lucide-react';

interface SecurityData {
  auditLogs: Array<{
    id: string;
    action: string;
    userId: string;
    userEmail: string;
    details: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
  failedLogins: Array<{
    id: string;
    email: string;
    ipAddress: string;
    userAgent: string;
    attemptCount: number;
    lastAttempt: string;
    blocked: boolean;
  }>;
  userSecurityStatus: Array<{
    id: string;
    email: string;
    role: string;
    lastLoginAt: string;
    activeSessions: number;
    twoFactorEnabled: boolean;
    passwordLastChanged: string;
    suspiciousActivity: boolean;
  }>;
  securityIncidents: Array<{
    id: string;
    type: 'FAILED_LOGIN' | 'SUSPICIOUS_ACTIVITY' | 'UNAUTHORIZED_ACCESS' | 'DATA_BREACH';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    affectedUsers: number;
    detectedAt: string;
    resolvedAt?: string;
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
  }>;
}

interface SecurityStats {
  totalIncidents: number;
  openIncidents: number;
  blockedUsers: number;
  suspiciousUsers: number;
  recentFailures: number;
}

export default function SecurityPage() {
  const [securityData, setSecurityData] = useState<SecurityData>({
    auditLogs: [],
    failedLogins: [],
    userSecurityStatus: [],
    securityIncidents: []
  });
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    totalIncidents: 0,
    openIncidents: 0,
    blockedUsers: 0,
    suspiciousUsers: 0,
    recentFailures: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState('');
  const [actionParams, setActionParams] = useState<Record<string, any>>({});
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/security');
      if (!response.ok) throw new Error('Failed to fetch security data');
      
      const data = await response.json();
      setSecurityData(data);
      
      // Calculate stats
      const stats: SecurityStats = {
        totalIncidents: data.securityIncidents?.length || 0,
        openIncidents: data.securityIncidents?.filter((i: any) => i.status === 'OPEN' || i.status === 'INVESTIGATING').length || 0,
        blockedUsers: data.failedLogins?.filter((f: any) => f.blocked).length || 0,
        suspiciousUsers: data.userSecurityStatus?.filter((u: any) => u.suspiciousActivity).length || 0,
        recentFailures: data.failedLogins?.filter((f: any) => {
          const lastAttempt = new Date(f.lastAttempt);
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return lastAttempt > oneDayAgo;
        }).length || 0
      };
      
      setSecurityStats(stats);
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeSecurityAction = async () => {
    if (!selectedAction) return;
    
    setIsExecuting(true);
    try {
      const response = await fetch('/api/admin/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: selectedAction,
          ...actionParams
        }),
      });
      
      if (!response.ok) throw new Error('Failed to execute security action');
      
      // Refresh data after action
      await fetchSecurityData();
      
      // Reset form
      setSelectedAction('');
      setActionParams({});
      
      alert('Security action executed successfully');
    } catch (error) {
      console.error('Error executing security action:', error);
      alert('Failed to execute security action');
    } finally {
      setIsExecuting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-white';
      case 'LOW': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800';
      case 'INVESTIGATING': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'FALSE_POSITIVE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'FAILED_LOGIN': return <Lock className="h-4 w-4" />;
      case 'SUSPICIOUS_ACTIVITY': return <AlertTriangle className="h-4 w-4" />;
      case 'UNAUTHORIZED_ACCESS': return <Shield className="h-4 w-4" />;
      case 'DATA_BREACH': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage security threats, user access, and system integrity
          </p>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">Total Incidents</span>
            </div>
            <p className="text-2xl font-bold">{securityStats.totalIncidents}</p>
            <p className="text-xs text-muted-foreground">
              {securityStats.openIncidents} open
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Open Incidents</span>
            </div>
            <p className="text-2xl font-bold">{securityStats.openIncidents}</p>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">Blocked Users</span>
            </div>
            <p className="text-2xl font-bold">{securityStats.blockedUsers}</p>
            <p className="text-xs text-muted-foreground">
              Due to failed attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">Suspicious Users</span>
            </div>
            <p className="text-2xl font-bold">{securityStats.suspiciousUsers}</p>
            <p className="text-xs text-muted-foreground">
              Flagged for review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Recent Failures</span>
            </div>
            <p className="text-2xl font-bold">{securityStats.recentFailures}</p>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Security Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Action Type</label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reset_password">Reset User Password</SelectItem>
                  <SelectItem value="revoke_sessions">Revoke User Sessions</SelectItem>
                  <SelectItem value="update_security_config">Update Security Config</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedAction === 'reset_password' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">User Email</label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={actionParams.email || ''}
                  onChange={(e) => setActionParams({ ...actionParams, email: e.target.value })}
                />
              </div>
            )}

            {selectedAction === 'revoke_sessions' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">User Email</label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={actionParams.email || ''}
                  onChange={(e) => setActionParams({ ...actionParams, email: e.target.value })}
                />
              </div>
            )}

            {selectedAction === 'update_security_config' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Configuration</label>
                <Select
                  value={actionParams.config || ''}
                  onValueChange={(value) => setActionParams({ ...actionParams, config: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select config" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="max_login_attempts">Max Login Attempts</SelectItem>
                    <SelectItem value="session_timeout">Session Timeout</SelectItem>
                    <SelectItem value="password_policy">Password Policy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedAction && (
              <div className="md:col-span-2">
                <Button
                  onClick={executeSecurityAction}
                  disabled={isExecuting}
                  className="w-full"
                >
                  {isExecuting ? 'Executing...' : 'Execute Action'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Security Incidents</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityData.securityIncidents?.map((incident) => (
              <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getIncidentIcon(incident.type)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{incident.type.replace('_', ' ')}</span>
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{incident.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {incident.affectedUsers} users affected
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Detected: {new Date(incident.detectedAt).toLocaleDateString()}
                  </p>
                  {incident.resolvedAt && (
                    <p className="text-sm text-muted-foreground">
                      Resolved: {new Date(incident.resolvedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Failed Login Attempts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>Failed Login Attempts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityData.failedLogins?.map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{attempt.email}</span>
                    <Badge variant={attempt.blocked ? 'destructive' : 'secondary'}>
                      {attempt.blocked ? 'Blocked' : 'Active'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {attempt.attemptCount} attempts
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Last: {new Date(attempt.lastAttempt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    IP: {attempt.ipAddress}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5" />
            <span>User Security Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityData.userSecurityStatus?.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{user.email}</span>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    {user.suspiciousActivity && (
                      <Badge variant="destructive">Suspicious</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user.activeSessions} active sessions
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Last login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    2FA: {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Security Events</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityData.auditLogs?.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge className={getSeverityColor(log.severity)}>
                    {log.severity}
                  </Badge>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{log.action}</span>
                      <span className="text-sm text-muted-foreground">by {log.userEmail}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.details}</p>
                    {log.ipAddress && (
                      <p className="text-xs text-muted-foreground">
                        IP: {log.ipAddress}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

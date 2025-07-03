import React, { useState, useContext, useEffect } from 'react';
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Activity, 
  Users, 
  FileText, 
  TrendingUp, 
  Globe,
  Database,
  Zap,
  Target,
  BarChart3,
  Download,
  Filter,
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Server,
  Shield,
  DollarSign,
  TrendingDown,
  Key,
  Plus,
  Copy,
  Trash2,
  Settings,
  Crown,
  Sparkles,
  Lock,
  Unlock,
  UserPlus,
  CreditCard,
  BarChart2,
  Monitor,
  Globe2,
  Layers,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { AuthContext } from '@/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { getUserAnalytics, UserAnalyticsItem } from '@/services/apiService';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [isCreatingAPIKey, setIsCreatingAPIKey] = useState(false);
  const [newUserName, setNewUserName] = useState('');
    const [selectedMetric, setSelectedMetric] = useState('all');
  const { isAuthenticated, user } = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<UserAnalyticsItem[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState('');

    useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to access analytics.',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [isAuthenticated, toast, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !user?.api_key) return;
    setLoadingAnalytics(true);
    getUserAnalytics(user.api_key)
      .then(setAnalytics)
      .catch((err) => {
        toast({ title: 'Analytics Error', description: err.message, variant: 'destructive' });
      })
      .finally(() => setLoadingAnalytics(false));
  }, [isAuthenticated, user, toast]);

  if (!isAuthenticated) {
    return null;
  }

  // Admin & Plan Data
  const adminData = {
    plan: 'Professional',
    totalUsers: 8,
    maxUsers: 15,
    monthlyCredits: 850000,
    usedCredits: 642340,
    revenue: 15670,
    planPrice: 299
  };

  // Sub-users/API Keys Data
  const apiKeys = [
    {
      id: 1,
      name: 'Frontend Team',
      email: 'frontend@company.com',
      apiKey: 'abcd',
      status: 'active',
      requests: 125670,
      creditsUsed: 87500,
      lastUsed: '2 minutes ago',
      created: '2024-01-15',
      rateLimit: '1000/min'
    },
    {
      id: 2,
      name: 'Mobile App',
      email: 'mobile@company.com',
      apiKey: 'abcd',
      status: 'active',
      requests: 98450,
      creditsUsed: 142300,
      lastUsed: '8 minutes ago',
      created: '2024-01-10',
      rateLimit: '500/min'
    },
    {
      id: 3,
      name: 'Analytics Service',
      email: 'analytics@company.com',
      apiKey: 'abcd',
      status: 'active',
      requests: 76890,
      creditsUsed: 95600,
      lastUsed: '1 hour ago',
      created: '2024-01-08',
      rateLimit: '750/min'
    },
    {
      id: 4,
      name: 'Development',
      email: 'dev@company.com',
      apiKey: 'abcd',
      status: 'inactive',
      requests: 23450,
      creditsUsed: 34200,
      lastUsed: '3 days ago',
      created: '2024-01-05',
      rateLimit: '200/min'
    },
    {
      id: 5,
      name: 'Marketing Tools',
      email: 'marketing@company.com',
      apiKey: 'abcd',
      status: 'suspended',
      requests: 156780,
      creditsUsed: 98400,
      lastUsed: '1 week ago',
      created: '2023-12-20',
      rateLimit: '300/min'
    }
  ];

  // Usage analytics data
  const usageData = [
    { date: '2024-01-01', requests: 145672, credits: 87340, revenue: 1240 },
    { date: '2024-01-02', requests: 162890, credits: 92450, revenue: 1456 },
    { date: '2024-01-03', requests: 178120, credits: 105670, revenue: 1789 },
    { date: '2024-01-04', requests: 195560, credits: 123890, revenue: 2034 },
    { date: '2024-01-05', requests: 187390, credits: 116780, revenue: 1890 },
    { date: '2024-01-06', requests: 203120, credits: 134560, revenue: 2340 },
    { date: '2024-01-07', requests: 218560, credits: 145780, revenue: 2678 }
  ];

  const topEndpoints = [
    { endpoint: '/api/v1/analyze/resume', usage: 45.6, requests: 456789, avgResponse: '234ms' },
    { endpoint: '/api/v1/skills/extract', usage: 23.4, requests: 234567, avgResponse: '189ms' },
    { endpoint: '/api/v1/jobs/match', usage: 15.8, requests: 158023, avgResponse: '312ms' },
    { endpoint: '/api/v1/projects/suggest', usage: 10.2, requests: 102890, avgResponse: '445ms' },
    { endpoint: '/api/v1/candidates/search', usage: 5.0, requests: 50234, avgResponse: '156ms' }
  ];

  const maskAPIKey = (key: string) => {
    return key.substring(0, 12) + '••••••••••••••••' + key.substring(key.length - 4);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'suspended': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <Clock className="h-4 w-4" />;
      case 'suspended': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleCreateAPIKey = () => {
    // Logic to create new API key
    console.log('Creating API key for:', newUserName, newUserEmail);
    setIsCreatingAPIKey(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/5 via-primary/10 to-accent/20 border border-primary/20 p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-48 translate-x-48" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent/20 to-transparent rounded-full translate-y-32 -translate-x-32" />
            
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <Crown className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground">Complete control over your API ecosystem</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
                    <Sparkles className="h-4 w-4 mr-2" />
                    {adminData.plan} Plan
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {adminData.totalUsers}/{adminData.maxUsers} Users
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 lg:mt-0">
                <Card className="bg-white/50 backdrop-blur-sm border-primary/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">${adminData.revenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/50 backdrop-blur-sm border-primary/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{(adminData.usedCredits / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-muted-foreground">Credits Used</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total API Keys', value: apiKeys.length, icon: Key, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Active Users', value: apiKeys.filter(k => k.status === 'active').length, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
              { title: 'Total Requests', value: '2.8M', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
              { title: 'Credits Remaining', value: `${((adminData.monthlyCredits - adminData.usedCredits) / 1000).toFixed(0)}K`, icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' }
            ].map((stat, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-accent/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-accent/50 backdrop-blur-sm">
              <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="api-keys" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Key className="h-4 w-4" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="usage" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Activity className="h-4 w-4" />
                Usage Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Usage Trends */}
                <Card className="border-0 bg-gradient-to-br from-white to-accent/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart2 className="h-5 w-5 text-primary" />
                      API Usage Trends
                    </CardTitle>
                    <CardDescription>Requests and credits consumption over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{
                      requests: { label: "Requests", color: "hsl(var(--primary))" },
                      credits: { label: "Credits", color: "hsl(var(--muted-foreground))" }
                    }} className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={usageData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area 
                            type="monotone" 
                            dataKey="requests" 
                            stackId="1"
                            stroke="hsl(var(--primary))" 
                            fill="hsl(var(--primary))" 
                            fillOpacity={0.3}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="credits" 
                            stackId="2"
                            stroke="hsl(var(--muted-foreground))" 
                            fill="hsl(var(--muted-foreground))" 
                            fillOpacity={0.2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Top Endpoints */}
                <Card className="border-0 bg-gradient-to-br from-white to-accent/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe2 className="h-5 w-5 text-primary" />
                      Top API Endpoints
                    </CardTitle>
                    <CardDescription>Most used endpoints by request volume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topEndpoints.map((endpoint, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-accent/20 border border-accent/30">
                          <div className="flex-1">
                            <p className="font-mono text-sm font-medium">{endpoint.endpoint}</p>
                            <p className="text-xs text-muted-foreground">{endpoint.requests.toLocaleString()} requests</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">{endpoint.usage}%</p>
                              <p className="text-xs text-muted-foreground">{endpoint.avgResponse}</p>
                            </div>
                            <div className="w-16 bg-accent/50 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${endpoint.usage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Credit Usage Progress */}
              <Card className="border-0 bg-gradient-to-r from-primary/5 to-accent/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Monthly Credit Usage</h3>
                      <p className="text-muted-foreground">
                        {adminData.usedCredits.toLocaleString()} / {adminData.monthlyCredits.toLocaleString()} credits used
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round((adminData.usedCredits / adminData.monthlyCredits) * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">consumed</div>
                    </div>
                  </div>
                  <div className="w-full bg-accent/50 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-primary to-primary/70 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${(adminData.usedCredits / adminData.monthlyCredits) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api-keys" className="space-y-6">
              {/* API Keys Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">API Key Management</h2>
                  <p className="text-muted-foreground">Create and manage sub-user API keys with usage monitoring</p>
                </div>
                
                <Dialog open={isCreatingAPIKey} onOpenChange={setIsCreatingAPIKey}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                      <Plus className="h-4 w-4 mr-2" />
                      Create API Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New API Key</DialogTitle>
                      <DialogDescription>
                        Generate a new API key for a team member or service.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">User Name</label>
                        <Input 
                          placeholder="e.g., Frontend Team"
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input 
                          placeholder="user@company.com"
                          type="email"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreateAPIKey} className="flex-1">
                          Create Key
                        </Button>
                        <Button variant="outline" onClick={() => setIsCreatingAPIKey(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* API Keys Table */}
              <Card className="border-0 bg-gradient-to-br from-white to-accent/10">
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User/Service</TableHead>
                          <TableHead>API Key</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Requests</TableHead>
                          <TableHead>Credits Used</TableHead>
                          <TableHead>Last Used</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiKeys.map((key) => (
                          <TableRow key={key.id} className="hover:bg-accent/20">
                            <TableCell>
                              <div>
                                <p className="font-medium">{key.name}</p>
                                <p className="text-sm text-muted-foreground">{key.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="bg-accent/50 px-2 py-1 rounded text-sm font-mono">
                                  {maskAPIKey(key.apiKey)}
                                </code>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(key.apiKey)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(key.status)} border flex items-center gap-1 w-fit`}>
                                {getStatusIcon(key.status)}
                                <span className="capitalize">{key.status}</span>
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{key.requests.toLocaleString()}</TableCell>
                            <TableCell className="font-medium">{key.creditsUsed.toLocaleString()}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{key.lastUsed}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <Settings className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage" className="space-y-6">
              <Card className="border-0 bg-gradient-to-br from-white to-accent/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Detailed Usage Analytics
                  </CardTitle>
                  <CardDescription>
                    Comprehensive usage metrics for all API keys and endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{
                    requests: { label: "API Requests", color: "hsl(var(--primary))" },
                    revenue: { label: "Revenue", color: "hsl(var(--muted-foreground))" }
                  }} className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={usageData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="requests" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="hsl(var(--muted-foreground))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--muted-foreground))', strokeWidth: 2, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 bg-gradient-to-br from-white to-accent/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Plan & Billing
                    </CardTitle>
                    <CardDescription>Manage your subscription and billing settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div>
                        <p className="font-semibold">{adminData.plan} Plan</p>
                        <p className="text-sm text-muted-foreground">${adminData.planPrice}/month</p>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        Active
                      </Badge>
                    </div>
                    <Button variant="outline" className="w-full">
                      Upgrade Plan
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-white to-accent/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Configure API security and access controls</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Rate Limiting</p>
                        <p className="text-sm text-muted-foreground">Enable rate limiting for API keys</p>
                      </div>
                      <div className="w-10 h-6 bg-primary rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">IP Whitelisting</p>
                        <p className="text-sm text-muted-foreground">Restrict access by IP address</p>
                      </div>
                      <div className="w-10 h-6 bg-gray-300 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
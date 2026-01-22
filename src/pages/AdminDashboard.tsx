import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Users, BarChart, ShieldAlert } from 'lucide-react';

export function AdminDashboard() {
  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-8 text-center">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Image Management</CardTitle>
            <Upload className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">Manage authentication images: upload, view, delete.</CardDescription>
            <Button className="w-full">Go to Image Manager</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">User Management</CardTitle>
            <Users className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">View and manage all registered user accounts.</CardDescription>
            <Button className="w-full">Go to User Manager</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Security Logs</CardTitle>
            <ShieldAlert className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">Monitor invalid login attempts and IP tracking.</CardDescription>
            <Button className="w-full">View Security Logs</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">System Reports</CardTitle>
            <BarChart className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">Generate reports on system activity and usage.</CardDescription>
            <Button className="w-full">Generate Reports</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

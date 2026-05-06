import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { useTodos } from '@/hooks/useTodos';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, ListTodo, CheckCircle2, Clock, AlertTriangle, Loader2 } from 'lucide-react';

export default function PersonalDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { todos, isLoading } = useTodos();

  const inProgressProjects = projects.filter(p => p.status !== 'completed');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const atRisk = projects.filter(p => p.status === 'at-risk' || p.status === 'delayed');

  const totalSubTodos = todos.reduce((acc, t) => acc + (t.sub_todos?.length || 0), 0);
  const doneSubTodos = todos.reduce(
    (acc, t) => acc + (t.sub_todos?.filter(s => s.is_done).length || 0),
    0,
  );

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = user?.email?.split('@')[0] ?? 'there';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {displayName}</h1>
        <p className="text-muted-foreground mt-1">Your personal workspace overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <FolderKanban className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressProjects.length}</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{atRisk.length}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">To Do Items</CardTitle>
            <ListTodo className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todos.length}</div>
            <p className="text-xs text-muted-foreground">
              {doneSubTodos}/{totalSubTodos} sub-tasks done
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects.length}</div>
            <p className="text-xs text-muted-foreground">Finished projects</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> In Progress
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/project-workflow')}>
              View all
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {inProgressProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No active projects yet. Create one in Project Workflow.
              </p>
            ) : (
              inProgressProjects.slice(0, 5).map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/40 cursor-pointer transition"
                  onClick={() => navigate('/project-workflow')}
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.title}</p>
                    {p.description && (
                      <p className="text-xs text-muted-foreground truncate">{p.description}</p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      p.status === 'on-track'
                        ? 'border-emerald-500/30 text-emerald-500'
                        : p.status === 'at-risk'
                          ? 'border-amber-500/30 text-amber-500'
                          : 'border-destructive/30 text-destructive'
                    }
                  >
                    {p.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5" /> To Do
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/todo')}>
              View all
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {todos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No to-do items yet. Add one in To Do.
              </p>
            ) : (
              todos.slice(0, 5).map(t => {
                const total = t.sub_todos?.length || 0;
                const done = t.sub_todos?.filter(s => s.is_done).length || 0;
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/40 cursor-pointer transition"
                    onClick={() => navigate('/todo')}
                  >
                    <p className="font-medium truncate">{t.title}</p>
                    {total > 0 && (
                      <Badge variant="outline">
                        {done}/{total}
                      </Badge>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

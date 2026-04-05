import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";

const ProjectsEmployee = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Projects</h1>
        <p className="text-sm text-slate-500 mt-1">Projects assigned to you will appear here.</p>
      </div>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Employee Project View</CardTitle>
          <CardDescription>
            Employee-side project details can be expanded here based on your next feature requirements.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          You have access to the centralized projects module as an employee.
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsEmployee;

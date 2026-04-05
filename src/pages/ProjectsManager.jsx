import { useEffect, useMemo } from "react";
import { useUser } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import Loader from "../ui/Loader";
import {
  getCardColorByIndex,
  getCurrentUserRoleByClerkId,
  getProjectsForManagerByClerkId,
} from "../services/apiProjects";

const ProjectsManager = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const roleQuery = useQuery({
    queryKey: ["projects-manager-role", user?.id],
    queryFn: () => getCurrentUserRoleByClerkId(user.id),
    enabled: isLoaded && !!user?.id,
  });

  const projectsQuery = useQuery({
    queryKey: ["projects-manager-list", user?.id],
    queryFn: () => getProjectsForManagerByClerkId(user.id),
    enabled: isLoaded && !!user?.id && roleQuery.data === "manager",
  });

  const projectCards = useMemo(() => projectsQuery.data || [], [projectsQuery.data]);

  useEffect(() => {
    if (!roleQuery.isLoading && roleQuery.data && roleQuery.data !== "manager") {
      navigate("/unauthorized", { replace: true });
    }
  }, [roleQuery.isLoading, roleQuery.data, navigate]);

  if (roleQuery.isLoading) {
    return <Loader title="Loading projects" subtitle="Validating manager access" />;
  }

  if (roleQuery.data !== "manager") {
    return null;
  }

  if (projectsQuery.isLoading) {
    return <Loader title="Loading projects" subtitle="Fetching your project list" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your projects from one centralized place.</p>
        </div>
        <Button
          onClick={() => navigate("/projects/manager/add-project")}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Add Project +
        </Button>
      </div>

      {projectCards.length === 0 ? (
        <Card className="border border-slate-200">
          <CardContent className="py-8 text-center text-slate-500">
            No projects found. Click Add Project to create your first project.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectCards.map((project, index) => (
            <button
              type="button"
              key={project.id}
              className={`rounded-xl border p-5 text-left transition hover:shadow-md ${getCardColorByIndex(index)}`}
              onClick={() => navigate(`/projects/manager/${project.id}`)}
            >
              <p className="text-lg font-semibold text-slate-900">{project.project_name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsManager;

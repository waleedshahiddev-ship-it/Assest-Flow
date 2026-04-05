import { useEffect } from "react";
import { useUser } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Loader from "../ui/Loader";
import { getCurrentUserRoleByClerkId } from "../services/apiProjects";

const Projects = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const roleQuery = useQuery({
    queryKey: ["projects-role", user?.id],
    queryFn: () => getCurrentUserRoleByClerkId(user.id),
    enabled: isLoaded && !!user?.id,
  });

  useEffect(() => {
    if (!roleQuery.isLoading && roleQuery.data) {
      if (roleQuery.data === "manager") {
        navigate("/projects/manager", { replace: true });
        return;
      }

      if (roleQuery.data === "employee") {
        navigate("/projects/employee", { replace: true });
        return;
      }

      navigate("/unauthorized", { replace: true });
    }
  }, [roleQuery.isLoading, roleQuery.data, navigate]);

  return <Loader title="Loading projects" subtitle="Checking your project access" />;
};

export default Projects;

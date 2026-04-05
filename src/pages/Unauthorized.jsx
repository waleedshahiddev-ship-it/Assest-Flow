import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";

const Unauthorized = () => {
  return (
    <div className="max-w-xl mx-auto py-16">
      <Card className="border border-rose-200 bg-rose-50/50">
        <CardHeader>
          <CardTitle className="text-rose-700">Unauthorized Access</CardTitle>
          <CardDescription className="text-rose-600">
            You do not have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/home">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;

import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Shield } from "lucide-react";

const ProfilePage = () => {
  const { email } = useAuth();
  const navigate = useNavigate();
  const username = email.split("@")[0];

  return (
    <div className="min-h-screen bg-background px-4 pt-6 pb-8">
      <div className="mx-auto max-w-lg">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>

        <h1 className="mb-6 text-2xl font-bold text-foreground">Profile</h1>

        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20 text-2xl font-bold text-accent">
            {username.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-foreground">{username}</h2>
          <p className="text-sm text-muted-foreground">Portfolio Owner</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <User className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Username</p>
              <p className="font-medium text-foreground">{username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <Mail className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <Shield className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Account Type</p>
              <p className="font-medium text-foreground">Personal</p>
            </div>
          </div>
        </div>

        <button onClick={() => navigate("/settings")}
          className="mt-8 w-full rounded-xl py-3 font-semibold text-foreground gradient-primary">
          Go to Settings
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;

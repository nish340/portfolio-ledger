import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Lock, LogOut, ChevronRight } from "lucide-react";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

const SettingsPage = () => {
  const { logout, changePassword, email } = useAuth();
  const navigate = useNavigate();
  const username = email.split("@")[0];
  const [showChangePass, setShowChangePass] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (newPass !== confirmPass) { toast.error("Passwords don't match"); return; }
    if (newPass.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setSaving(true);
    try {
      await changePassword(oldPass, newPass);
      toast.success("Password changed successfully!");
      setOldPass(""); setNewPass(""); setConfirmPass("");
      setShowChangePass(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-lg px-4 pt-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Settings</h1>

        <div className="mb-6 flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-lg font-bold text-accent">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{username}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <button onClick={() => navigate("/profile")}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent/30">
            <User className="h-5 w-5 text-accent" />
            <span className="flex-1 text-left font-medium text-foreground">Profile</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <button onClick={() => setShowChangePass(!showChangePass)}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent/30">
            <Lock className="h-5 w-5 text-accent" />
            <span className="flex-1 text-left font-medium text-foreground">Change Password</span>
            <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showChangePass ? "rotate-90" : ""}`} />
          </button>

          {showChangePass && (
            <div className="space-y-3 rounded-xl border border-accent/30 bg-card p-4 animate-fade-in">
              <input type="password" placeholder="Current password" value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none" />
              <input type="password" placeholder="New password (min 6 chars)" value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none" />
              <input type="password" placeholder="Confirm new password" value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none" />
              <button onClick={handleChangePassword} disabled={saving}
                className="w-full rounded-lg py-2.5 text-sm font-semibold text-foreground gradient-primary disabled:opacity-60">
                {saving ? "Updating..." : "Update Password"}
              </button>
            </div>
          )}

          <button onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-destructive/20 bg-card p-4 transition-colors hover:bg-destructive/5">
            <LogOut className="h-5 w-5 text-danger" />
            <span className="flex-1 text-left font-medium text-danger">Logout</span>
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default SettingsPage;

import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Lock, LogOut, ChevronRight } from "lucide-react";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";

const SettingsPage = () => {
  const { logout, changePassword, username } = useAuth();
  const navigate = useNavigate();
  const [showChangePass, setShowChangePass] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [msg, setMsg] = useState("");

  const handleChangePassword = () => {
    if (newPass !== confirmPass) {
      setMsg("Passwords don't match");
      return;
    }
    if (newPass.length < 4) {
      setMsg("Password too short");
      return;
    }
    if (changePassword(oldPass, newPass)) {
      setMsg("Password changed successfully!");
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
      setTimeout(() => { setShowChangePass(false); setMsg(""); }, 1500);
    } else {
      setMsg("Current password is incorrect");
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

        {/* Profile Card */}
        <div className="mb-6 flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-lg font-bold text-accent">
            {username.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{username}</p>
            <p className="text-xs text-muted-foreground">Personal Portfolio</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          <button
            onClick={() => navigate("/profile")}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent/30"
          >
            <User className="h-5 w-5 text-accent" />
            <span className="flex-1 text-left font-medium text-foreground">Profile</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <button
            onClick={() => setShowChangePass(!showChangePass)}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent/30"
          >
            <Lock className="h-5 w-5 text-accent" />
            <span className="flex-1 text-left font-medium text-foreground">Change Password</span>
            <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showChangePass ? "rotate-90" : ""}`} />
          </button>

          {showChangePass && (
            <div className="space-y-3 rounded-xl border border-accent/30 bg-card p-4 animate-fade-in">
              <input
                type="password"
                placeholder="Current password"
                value={oldPass}
                onChange={(e) => { setOldPass(e.target.value); setMsg(""); }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
              />
              <input
                type="password"
                placeholder="New password"
                value={newPass}
                onChange={(e) => { setNewPass(e.target.value); setMsg(""); }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPass}
                onChange={(e) => { setConfirmPass(e.target.value); setMsg(""); }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
              />
              {msg && (
                <p className={`text-xs ${msg.includes("success") ? "text-success" : "text-danger"}`}>{msg}</p>
              )}
              <button
                onClick={handleChangePassword}
                className="w-full rounded-lg py-2.5 text-sm font-semibold text-foreground gradient-primary"
              >
                Update Password
              </button>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-destructive/20 bg-card p-4 transition-colors hover:bg-destructive/5"
          >
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

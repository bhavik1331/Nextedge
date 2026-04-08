import React, { useState, useEffect, useRef } from "react";
import { User, Mail, Shield, Camera, Edit2, CheckCircle, Save, XCircle, Settings, Key, Globe, Link, FileText, BadgeCheck, Code, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/axios";

const ProfileField = ({ icon: Icon, label, value, name, type = "text", disabled = true, onChange }) => (
  <div className="flex flex-col space-y-2 group">
    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">{label}</label>
    <div className={`relative flex items-center bg-background border ${disabled ? 'border-border' : 'border-indigo-500/50'} rounded-2xl p-4 transition-all duration-300 shadow-sm`}>
       <div className={`mr-4 p-2 rounded-xl bg-muted/80 group-hover:scale-110 transition-transform duration-500 ${disabled ? 'text-muted-foreground' : 'text-indigo-500'}`}>
          <Icon className="w-5 h-5 transition-colors" />
       </div>
       <input 
          type={type} 
          name={name}
          value={value} 
          readOnly={disabled}
          onChange={onChange}
          className="flex-1 bg-transparent text-foreground font-bold focus:outline-none placeholder-gray-500 truncate"
          placeholder={`Enter your ${label.toLowerCase()}...`}
       />
       {disabled && <Shield className="w-4 h-4 text-gray-400 ml-2" />}
    </div>
  </div>
);

const TextAreaField = ({ icon: Icon, label, value, name, disabled = true, onChange }) => (
  <div className="flex flex-col space-y-2 group">
    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">{label}</label>
    <div className={`relative flex items-start bg-background border ${disabled ? 'border-border' : 'border-indigo-500/50'} rounded-2xl p-4 transition-all duration-300 shadow-sm`}>
       <div className={`mr-4 p-2 rounded-xl bg-muted/80 group-hover:scale-110 transition-transform duration-500 ${disabled ? 'text-muted-foreground' : 'text-indigo-500'}`}>
          <Icon className="w-5 h-5 transition-colors" />
       </div>
       <textarea 
          name={name}
          value={value} 
          readOnly={disabled}
          onChange={onChange}
          rows={3}
          className="flex-1 bg-transparent text-foreground font-bold focus:outline-none placeholder-gray-500 resize-none h-24"
          placeholder={`Enter your ${label.toLowerCase()}...`}
       />
    </div>
  </div>
);

const MemberProfile = () => {
  const { member, refreshToken } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    description: "",
    skills: ""
  });
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || "",
        bio: member.bio || "",
        description: member.description || "",
        skills: Array.isArray(member.skills) ? member.skills.join(", ") : ""
      });
    }
  }, [member]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image too large (max 5MB)" });
      return;
    }

    setAvatarLoading(true);
    const formDataObj = new FormData();
    formDataObj.append("avatar", file);

    try {
      const res = await api.post("/members/avatar", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setMessage({ type: "success", text: "Profile photo updated!" });
        await refreshToken();
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      setMessage({ type: "error", text: "Failed to upload photo." });
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const skillsArray = formData.skills.split(",").map(s => s.trim()).filter(s => s !== "");
      const res = await api.put("/members/profile", {
        ...formData,
        skills: skillsArray
      });

      if (res.data.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setIsEditing(false);
        await refreshToken();
      }
    } catch (error) {
      console.error("Save error:", error);
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Profile Header Block */}
      <div className="bg-card rounded-[3.5rem] p-10 border border-border shadow-lg relative overflow-hidden group/header transition-colors">
         <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none group-hover/header:opacity-60 transition-opacity duration-1000"></div>
         <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none group-hover/header:opacity-60 transition-opacity duration-1000"></div>

         <div className="flex flex-col lg:flex-row items-center lg:items-end gap-10 relative z-10">
            {/* Avatar Section */}
            <div className="relative group/avatar cursor-pointer" onClick={handleAvatarClick}>
               <div className="w-48 h-48 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-indigo-400 p-2 shadow-2xl shadow-indigo-500/20 group-hover/avatar:scale-105 transition-transform duration-700">
                  <div className="w-full h-full rounded-[2.5rem] bg-card flex items-center justify-center overflow-hidden border-4 border-card">
                     {avatarLoading ? (
                       <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                     ) : member?.avatar ? (
                        <img src={member.avatar} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                        <span className="text-7xl font-black text-foreground">{member?.name ? member.name.charAt(0).toUpperCase() : "U"}</span>
                     )}
                  </div>
               </div>
               <button className="absolute bottom-2 right-2 p-4 bg-indigo-600 text-white rounded-2xl shadow-xl border-4 border-card hover:bg-indigo-500 hover:scale-110 active:scale-95 transition-all duration-300">
                  <Camera className="w-5 h-5" />
               </button>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleAvatarChange} 
                 accept="image/*" 
                 className="hidden" 
               />
            </div>

            <div className="flex-1 text-center lg:text-left space-y-4">
               <div>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-2">
                     <h1 className="text-5xl font-black text-foreground tracking-tighter leading-none italic uppercase">{member?.name || "Member Name"}</h1>
                     <span className="px-5 py-2 bg-indigo-600/10 text-indigo-500 border border-indigo-500/30 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-inner shadow-indigo-500/10 inline-block w-fit mx-auto lg:mx-0">
                        {member?.role || "Verified Member"}
                     </span>
                  </div>
                  <p className="text-muted-foreground text-lg font-medium max-w-xl">Member since {new Date(member?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.</p>
               </div>

               <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  {member?.skills?.slice(0, 3).map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-muted border border-border px-4 py-2 rounded-xl hover:border-indigo-500/30 transition-colors cursor-default">
                       <BadgeCheck className="w-4 h-4 text-indigo-500" />
                       <span className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">{skill}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="flex flex-col gap-4">
               <button 
                  onClick={toggleEdit}
                  disabled={loading}
                  className={`flex items-center gap-3 font-black text-sm uppercase tracking-widest px-8 py-5 rounded-2xl shadow-xl transition-all active:scale-95 duration-200 ${
                    isEditing 
                    ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20" 
                    : "bg-muted border border-border text-foreground hover:bg-card hover:border-indigo-500/30"
                  }`}
               >
                  {loading ? "..." : (isEditing ? <Save className="w-5 h-5" /> : <Edit2 className="w-4 h-4" />)}
                  {isEditing ? "Save Selection" : "Edit Profile"}
               </button>
               {message.text && (
                 <div className={`text-xs font-bold text-center p-2 rounded-xl border ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                   {message.text}
                 </div>
               )}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 h-full">
         <div className="lg:col-span-1 space-y-10 h-full">
            <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-md h-full flex flex-col transition-colors">
               <h3 className="text-xl font-black text-foreground mb-8 px-2 flex items-center gap-4">
                  <Settings className="w-6 h-6 text-indigo-500" />
                  Experience & Skills
               </h3>
               
               <div className="space-y-6 flex-1">
                  <ProfileField icon={Code} label="Skills (comma separated)" name="skills" value={formData.skills} disabled={!isEditing} onChange={handleChange} />
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                     {formData.skills.split(",").map((s, i) => s.trim() && (
                       <span key={i} className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-md">
                         {s.trim()}
                       </span>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         <div className="lg:col-span-2">
            <div className="bg-card rounded-[2.5rem] p-10 border border-border shadow-md h-full relative group/form transition-colors">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none"></div>

               <h3 className="text-2xl font-black text-foreground mb-10 border-b border-border pb-6 flex items-center justify-between">
                  Profile Information
                  {isEditing && (
                    <span className="text-[10px] font-black italic text-indigo-500 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 uppercase tracking-[0.2em] animate-pulse">Editing Mode</span>
                  )}
               </h3>

               <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                     <ProfileField icon={User} label="Full Name" name="name" value={formData.name} disabled={!isEditing} onChange={handleChange} />
                     <ProfileField icon={Mail} label="Email Address" value={member?.email || ""} disabled={true} />
                  </div>
                  
                  <ProfileField icon={BadgeCheck} label="One-line Bio" name="bio" value={formData.bio} disabled={!isEditing} onChange={handleChange} />
                  <TextAreaField icon={FileText} label="Full Description" name="description" value={formData.description} disabled={!isEditing} onChange={handleChange} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                     <ProfileField icon={Shield} label="Account Role" value={member?.role || "Member"} disabled={true} />
                     <ProfileField icon={Globe} label="One-line ID" value={member?._id?.substring(18) || "M-X2"} disabled={true} />
                  </div>
               </div>

               <div className="mt-12 p-8 bg-muted/20 border border-border rounded-[2.5rem] border-dashed">
                  <div className="flex items-start gap-5">
                     <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-500 shrink-0">
                        <Save className="w-7 h-7" />
                     </div>
                     <div>
                        <h4 className="text-lg font-black text-foreground mb-1 leading-none">Security Protocol</h4>
                        <p className="text-sm font-medium text-muted-foreground mb-4 max-w-sm">Your primary identifier (email) and role are restricted to administrative oversight.</p>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                           <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Profile Status: Active</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default MemberProfile;

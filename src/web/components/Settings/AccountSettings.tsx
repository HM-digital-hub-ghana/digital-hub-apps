import { Camera, Loader2, Lock, Trash2 } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
  apiDeleteAvatar,
  apiGetUserProfile,
  apiUpdateUserProfile,
  apiUploadAvatar,
  type UpdateUserProfilePayload,
  type UserProfile,
} from "@web/conference-and-visitors-booking/service/user";
import { handleApiError } from "@/lib/utils";
import { routes } from "../../conference-and-visitors-booking/constants/routes";

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/jpg",
];

export default function AccountSettings() {
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [staffId, setStaffId] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initialPhone, setInitialPhone] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoadingProfile(true);
      const profile = await apiGetUserProfile();
      populateProfile(profile);
    } catch (error) {
      const message = handleApiError(
        error,
        "Failed to load profile information.",
        "AccountSettings.fetchProfile"
      );
      toast.error(message);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const populateProfile = (profile: UserProfile) => {
    const combinedName = [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    setFullName(combinedName);
    setEmail(profile.email ?? "");
    const nextPhone = profile.phone ?? "";
    setPhone(nextPhone);
    setInitialPhone(nextPhone);
    setStaffId(profile.staff_id ?? "");
    setAvatarUrl(profile.avatar ?? null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedPhone = phone.trim();
    const previousPhone = initialPhone.trim();

    if (normalizedPhone === previousPhone) {
      toast.error("No changes to save.");
      return;
    }

    const payload: UpdateUserProfilePayload = {
      phone: normalizedPhone ? normalizedPhone : null,
    };

    try {
      setIsSavingProfile(true);
      const response = await apiUpdateUserProfile(payload);
      populateProfile(response.user);
      persistUserSnapshot(response.user);

      toast.success(response.message ?? "Profile updated successfully.");
    } catch (error) {
      const message = handleApiError(
        error,
        "Failed to update profile.",
        "AccountSettings.handleSubmit"
      );
      toast.error(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const updateAuthUserSnapshot = (partial: {
    name?: string;
    email?: string;
    avatar?: string | null;
  }) => {
    let existingSnapshot: Record<string, unknown> = {};
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        existingSnapshot = JSON.parse(raw) as Record<string, unknown>;
      }
    } catch {
      existingSnapshot = {};
    }

    const authUserSnapshot = {
      ...existingSnapshot,
      ...partial,
    };

    localStorage.setItem("user", JSON.stringify(authUserSnapshot));
    window.dispatchEvent(
      new CustomEvent("userProfileUpdated", { detail: authUserSnapshot })
    );
  };

  const persistUserSnapshot = (user: UserProfile) => {
    const formattedName = [user.first_name, user.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    updateAuthUserSnapshot({
      name: formattedName || user.email,
      email: user.email,
      avatar: user.avatar ?? null,
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or GIF image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error("Image is too large. Maximum size is 2MB.");
      event.target.value = "";
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const { avatar_url, message } = await apiUploadAvatar(file);
      setAvatarUrl(avatar_url);
      updateAuthUserSnapshot({ avatar: avatar_url });
      toast.success(message ?? "Profile photo uploaded successfully.");
    } catch (error) {
      const message = handleApiError(
        error,
        "Failed to upload profile photo.",
        "AccountSettings.handleFileChange"
      );
      toast.error(message);
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setIsDeletingAvatar(true);
      await apiDeleteAvatar();
      setAvatarUrl(null);
      updateAuthUserSnapshot({ avatar: null });
      toast.success("Profile photo deleted successfully.");
    } catch (error) {
      const message = handleApiError(
        error,
        "Failed to delete profile photo.",
        "AccountSettings.handleDeleteAvatar"
      );
      toast.error(message);
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  const handleChangePasswordClick = () => {
    navigate(routes.forgotPassword, {
      state: {
        title: "Change Password",
        description: "Enter your email to receive a password reset link.",
      },
    });
  };

  const initials = useMemo(() => {
    if (avatarUrl) {
      return "";
    }
    return computeInitials(fullName || email);
  }, [avatarUrl, fullName, email]);

  if (isLoadingProfile) {
    return (
      <div className="border border-[#E5E7EB] bg-white p-6 rounded-[8.75px]">
        <p className="text-sm text-[#717182]">Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-[16px]">
      <div className="border border-[#E5E7EB] flex flex-col gap-3 p-[16px] rounded-[8.75px] bg-white">
        <h1 className="text-[14px]">Profile Photo</h1>
        <div className="flex h-[84px] items-center gap-5">
          <div className="w-[84px] h-[84px] rounded-full bg-[#024D2C] flex items-center justify-center relative text-white overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-medium">{initials}</span>
            )}
            <div className="w-[32px] h-[32px] rounded-full flex items-center absolute bottom-0 right-0 justify-center bg-white shadow-sm">
              {isUploadingAvatar ? (
                <Loader2 className="w-[18px] h-[18px] animate-spin text-primary" />
              ) : (
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="bg-primary w-[27px] h-[27px] rounded-full flex items-center justify-center"
                >
                <Camera className="w-[14px] h-[14px] text-white" />
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <button
              type="button"
              onClick={handleUploadClick}
              className="w-[134px] flex items-center justify-center bg-primary text-white h-[31.5px] rounded-[6.75px] text-[12.25px] disabled:opacity-70"
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Photo"
              )}
            </button>
            <p className="text-[#717182] text-[14px]">
              JPG, PNG or GIF. Max size 2MB
            </p>
            {avatarUrl && (
              <button
                type="button"
                onClick={handleDeleteAvatar}
                className="flex items-center gap-1 text-[12.25px] text-[#E7000B] disabled:opacity-70"
                disabled={isDeletingAvatar}
              >
                {isDeletingAvatar ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove photo
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="border flex flex-col gap-3 border-[#E5E7EB] bg-white p-[16px] rounded-[8.75px]">
        <div className="flex items-center justify-between">
          <h1 className="text-[16px] font-semibold">Personal Information</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col">
              <label htmlFor="fullName" className="text-[14.25px]">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={fullName}
                readOnly
                disabled
                placeholder="Nina Miller"
                className="border h-[38px] rounded-[6.75px] w-full border-[#E5E7EB] px-3 bg-[#F1F5F9] text-[13px] text-[#6B7280] cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="email" className="text-[14.25px]">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                readOnly
                disabled
                placeholder="nina.miller@company.com"
                className="border h-[38px] rounded-[6.75px] w-full border-[#E5E7EB] px-3 bg-[#F1F5F9] text-[13px] text-[#6B7280] cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="phone" className="text-[14.25px]">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+1234567890"
                className="border h-[38px] rounded-[6.75px] w-full border-[#E5E7EB] px-3 bg-[#F8FAFC] text-[13px]"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="staffId" className="text-[14.25px]">
                Staff ID
                  </label>
                  <input
                id="staffId"
                name="staffId"
                type="text"
                value={staffId}
                disabled
                className="border h-[38px] rounded-[6.75px] w-full border-[#E5E7EB] px-3 bg-[#F8FAFC] text-[13px] text-[#6B7280] cursor-not-allowed"
                  />
                </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary text-white text-[12.25px] min-w-[140px] h-[38px] flex items-center justify-center rounded-[6.75px] disabled:opacity-70"
              disabled={isSavingProfile}
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="border flex flex-col gap-2 border-[#E5E7EB] bg-white p-[16px] rounded-[8.75px]">
        <div className="flex items-center">
          <p className="text-[20px] ">Security</p>
        </div>

        <div className="flex items-center justify-between border border-[#E5E7EB] p-[14px] rounded-[8.75px]">
          <div className="flex justify-between items-center gap-5">
            <div className="w-[42px] h-[42px] bg-[#024D2C14] flex items-center justify-center rounded-[8.75px]">
              <Lock className="w-[17.5px] h-[17.5px] text-[#024D2C]" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-400 ">Change Password</h2>
              <p className="text-[14px] text-[#717182]">
                Update your password regularly
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleChangePasswordClick}
            className="w-[84px] h-[31.5px] rounded-[6.75px] flex items-center justify-center text-[12.25px] border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] transition-colors"
          >
            Change
          </button>
        </div>
      </div>
    </div>
  );
}

function computeInitials(value: string): string {
  if (!value) {
    return "U";
  }

  const words = value.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

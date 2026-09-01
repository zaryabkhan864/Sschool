import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUpdateProfileMutation } from "../../redux/api/authApi";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import MetaData from "../layout/MetaData";
import UserLayout from "../GUI/UserLayout";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppButton from "../GUI/AppButton";
import AvatarUpload from "../GUI/AvatarUpload";

const UpdateProfile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");

  const navigate = useNavigate();

  const [updateProfile, { isLoading, error, isSuccess }] =
    useUpdateProfileMutation();

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      setName(user?.name || "");
      setEmail(user?.email || "");
      setAvatar(user?.avatar?.url || "");
      setAvatarPreview(user?.avatar?.url || "");
    }

    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Profile Updated Successfully");
      navigate("/me/profile");
    }
  }, [user, error, isSuccess, navigate]);

  const onChange = (e) => {
    const { name, value, type, files } = e.target;
    if (name === "avatar") {
      const file = files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      if (name === "name") setName(value);
      if (name === "email") setEmail(value);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();

    const userData = {
      name,
      email,
      avatar: avatar || undefined, // only send if changed
    };

    updateProfile(userData);
  };

  return (
    <UserLayout>
      <MetaData title={"Update Profile"} />

      <div className="max-w-4xl mx-auto">
        <AppPageHeader
          title="Update Profile"
          subtitle="Edit your personal information"
          backUrl="/me/profile"
        />

        <form onSubmit={submitHandler}>
          <AppCard
            title="Edit Details"
            icon="fa-user-edit"
            footer={
              <div className="flex justify-end gap-2">
                <AppButton backUrl="/me/profile" />
                <AppButton
                  type="submit"
                  label="Update"
                  loadingLabel="Updating..."
                  isLoading={isLoading}
                  icon="fa-save"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AppInput
                label="Full Name"
                name="name"
                value={name}
                onChange={onChange}
                required
              />
              <AppInput
                label="Email Address"
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                required
              />
            </div>

            <div className="mt-6">
              <AvatarUpload
                preview={avatarPreview}
                onChange={onChange}
                title="Profile Picture"
                subtitle="Max size 2MB"
              />
            </div>
          </AppCard>
        </form>
      </div>
    </UserLayout>
  );
};

export default UpdateProfile;
import React from "react";
import { useSelector } from "react-redux";
import MetaData from "../layout/MetaData";
import UserLayout from "../GUI/UserLayout";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <UserLayout>
      <MetaData title={"Your Profile"} />

      <div className="max-w-4xl mx-auto">
        <AppPageHeader
          title="Your Profile"
          subtitle="Personal information"
        />

        <AppCard title="Profile Details" icon="fa-user">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-32 md:w-48 shrink-0">
              <figure className="rounded-full overflow-hidden border border-gray-300">
                <img
                  className="w-full h-auto"
                  src={user?.avatar ? user?.avatar?.url : "/images/default_avatar.jpg"}
                  alt={user?.name}
                />
              </figure>
            </div>

            {/* User fields – styled exactly like your AppInput labels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <div>
                <h4 className="text-[11px] font-semibold text-gray-500 uppercase">
                  Full Name
                </h4>
                <p className="text-sm font-medium text-gray-800">
                  {user?.name}
                </p>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-gray-500 uppercase">
                  Email Address
                </h4>
                <p className="text-sm font-medium text-gray-800">
                  {user?.email}
                </p>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-gray-500 uppercase">
                  Joined On
                </h4>
                <p className="text-sm font-medium text-gray-800">
                  {user?.createdAt?.substring(0, 10)}
                </p>
              </div>
            </div>
          </div>
        </AppCard>
      </div>
    </UserLayout>
  );
};

export default Profile;
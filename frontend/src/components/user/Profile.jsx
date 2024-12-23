import React from "react";
import UserLayout from "../layout/UserLayout";
import { useSelector } from "react-redux";
import MetaData from "../layout/MetaData";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  return (
    <UserLayout>
      <MetaData title={"Your Profile"} />
      <div className="flex flex-col md:flex-row justify-around items-center mt-10">
        <div className="w-32 md:w-48 mb-6 md:mb-0">
          <figure className="rounded-full overflow-hidden border border-gray-300">
            <img
              className="w-full h-auto"
              src={
                user?.avatar ? user?.avatar?.url : "/images/default_avatar.jpg"
              }
              alt={user?.name}
            />
          </figure>
        </div>

        <div className="w-full md:w-1/2 text-center md:text-left">
          <div className="mb-4">
            <h4 className="text-lg font-semibold">Full Name</h4>
            <p className="text-gray-700">{user?.name}</p>
          </div>

          <div className="mb-4">
            <h4 className="text-lg font-semibold">Email Address</h4>
            <p className="text-gray-700">{user?.email}</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold">Joined On</h4>
            <p className="text-gray-700">{user?.createdAt?.substring(0, 10)}</p>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default Profile;

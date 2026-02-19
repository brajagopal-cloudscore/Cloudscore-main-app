'use client';
import React, { useContext, useEffect, useState } from 'react';
import { BsQuestionCircle, BsFillChatLeftTextFill } from 'react-icons/bs';
import Link from 'next/link';
import './admin.css';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Avatar,
} from '@nextui-org/react';
import { ServerLogout } from '@/lib/api/auth';
// Removed DataContext dependency - using local state instead
import { GoBell } from 'react-icons/go';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCookie } from 'cookies-next';
import { useSearchStore } from '../search/data-factory/store';

const Header = () => {
  const queryClient = useQueryClient();
  const { setUserData } = useSearchStore();

  const [isPopupVisible, setPopupVisible] = useState(false);
  // Local state for modal management instead of context
  const [openModal, setOpenModal] = useState<string>('');
  const { userData: userProfile } = useSearchStore();
  const router = useRouter();
  function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const togglePopup = () => {
    setPopupVisible(!isPopupVisible);
  };

  const handleSupportClick = () => {
    setOpenModal('feedback');
  };

  const { mutate: logout } = useMutation({
    mutationFn: () => ServerLogout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['userData'] });
      setUserData({} as LoggedInUserProfile);
      deleteCookie('accessToken');
      deleteCookie('refreshToken');
      deleteCookie('userRole');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('project-tab');
      localStorage.removeItem('selectedModel');
      localStorage.removeItem('selectedProject');
      localStorage.removeItem('selectedLLMModel');
      localStorage.removeItem('logout-event');
      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel("auth");
        channel.postMessage({ type: "LOGOUT" });
        channel.close();
      }
      localStorage.setItem("logout-event", Date.now().toString());
      sessionStorage.clear();
      window.location.href = '/';
    },
    onError: (error: any) => {
      toast.error(error?.message || error?.response?.data?.detail || error?.response?.data?.message);
    }
  });

  return (
    <div className="z-10 topBar  flex h-[60px] w-full justify-between items-center">
      <div className="flex mx-6 flex-1 items-center gap-5">
        {/* <div className="flex bg-[#7828C8] rounded-[7px] text-[20px] italic h-[45px] w-[48px] font-semibold  justify-center items-center">
          K
        </div> */}
        <div className="flex flex-row gap-[6px]  ">
          <p className="flex font-bold  text-xl mainText">
            Kentron Admin Center
          </p>
        </div>
      </div>
      <div className="flex flex-1 justify-end h-full mx-5 items-center ">
        <GoBell color="#000" size={24} />
        <span className="flex mx-5">
          <BsQuestionCircle color="#000" size={24} />
        </span>
        <span className="flex mr-5 cursor-pointer" onClick={handleSupportClick}>
          <BsFillChatLeftTextFill color="#000" size={24} />
        </span>
        <Dropdown className="flex flex-col  text-black">
          <DropdownTrigger>
            <Avatar
              size="md"
              classNames={{
                name: 'font-bold text-lg',
              }}
              name={userProfile?.name ? userProfile?.name[0] : ''}
            />
          </DropdownTrigger>

          <DropdownMenu
            className="flex w-full h-full flex-col"
            aria-label="Static Actions"
          >
            <DropdownItem
              className="flex items-center flex-1 border-b border-gray-300"
              key="new"
            >
              <div className="flex h-full w-full py-2">
                <Avatar
                  size="md"
                  classNames={{
                    name: 'font-bold text-lg',
                  }}
                  name={userProfile?.name ? userProfile?.name[0] : ''}
                />
                <p className="flex flex-col h-[4vh] text-black flex-1">
                  <p className="flex w-full mx-2 items-center font-bold">
                    {userProfile?.name}
                  </p>
                  <p className="flex w-full mx-2 items-center text-sm font-normal">
                    {userProfile?.email}
                  </p>
                </p>
              </div>
            </DropdownItem>
            <DropdownItem
              className="flex items-center flex-1 border-b border-gray-300"
              key="new"
            >
              <div className="flex h-full w-full py-1">
                <p className="flex w-full mx-2 items-center font-bold">
                  {userProfile?.role === 'globaladmin'
                    ? 'Global Admin'
                    : capitalize(userProfile?.role ?? '')}
                </p>
              </div>
            </DropdownItem>
            <DropdownItem
              className="flex text-black h-[3vh] p-2"
              key="edit"
            >
              <p
                onClick={() => logout()}
                className="flex h-full items-center"
              >
                Sign Out
              </p>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export default Header;

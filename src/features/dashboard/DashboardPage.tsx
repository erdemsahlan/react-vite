import React from 'react';
import Sidebar from '../../assets/Sidebar';
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom";
import HotelRoomDesigner from './HotelRoomDesigner';

const DashboardPage: React.FC = () => {
  return (
   <>

          <HotelRoomDesigner />
          </>

  );
};

export default DashboardPage; 
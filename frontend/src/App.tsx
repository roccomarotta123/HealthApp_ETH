import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Patient from "./pages/Patient";
import Doctor from "./pages/Doctor";
import AccessControl from "./pages/AccessControl";
import DoctorRecords from "./pages/DoctorRecords";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/patient" element={<Patient />} />
      <Route path="/doctor" element={<Doctor />} />
      <Route path="/access-control" element={<AccessControl />} />
      <Route path="/doctor-records" element={<DoctorRecords />} />
    </Routes>
  );
};

export default App;

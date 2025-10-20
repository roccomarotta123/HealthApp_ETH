import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Patient from "./pages/Patient";
import Doctor from "./pages/Doctor";
import AccessControl from "./pages/AccessControl";
import DoctorRecords from "./pages/DoctorRecords";
import RequestVerification from "./pages/RequestVerification";
import VerificheStato from "./pages/VerificheStato";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/patient" element={<Patient />} />
      <Route path="/doctor" element={<Doctor />} />
  <Route path="/request-verification" element={<RequestVerification />} />
  <Route path="/verifiche-stato" element={<VerificheStato />} />
      <Route path="/access-control" element={<AccessControl />} />
      <Route path="/doctor-records" element={<DoctorRecords />} />
    </Routes>
  );
};

export default App;

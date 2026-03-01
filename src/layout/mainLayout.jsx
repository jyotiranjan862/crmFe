
import React from "react";
import Sidebar from "../components/Sidebar";

const MainLayout = ({ children }) => {
	return (
		<div style={{ display: "flex", minHeight: "100vh" }}>
			<Sidebar />
			<div style={{ flex: 1, padding: "24px" }}>
				{children}
			</div>
		</div>
	);
};

export default MainLayout;

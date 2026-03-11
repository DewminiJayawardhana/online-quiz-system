import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Redirect for logout/dashboard
import { api } from "../../api/api";
import "./StudentProfiles.css";

export default function StudentProfiles() {
    const [profiles, setProfiles] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // Search state
    const navigate = useNavigate();

    // Fetch student profiles
    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                // Corrected backend URL
                const res = await api.get("/api/student/quizzes/admin-profiles"); 
                setProfiles(res.data);
            } catch (err) {
                console.error("Error fetching profiles:", err);
            }
        };
        fetchProfiles();
    }, []);

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem("token"); // adjust key if needed
        localStorage.removeItem("role");
        navigate("/admin/login");
    };
    // Filter profiles by search term
    const filteredProfiles = profiles.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-page">
            <div className="admin-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2>Student Performance Profiles 🎓</h2>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "300px" }}
                    />
                    
                    {/* Dashboard & Logout Buttons */}
                    <div className="header-buttons">
                        <button
                            onClick={() => navigate("/admin/dashboard")}
                            className="st-btn"
                            style={{ backgroundColor: "#64748b" }}
                        >
                            Back to Dashboard
                        </button>
                        <button
                            onClick={handleLogout}
                            className="st-btn"
                            style={{ backgroundColor: "#ef4444" }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <table className="profile-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Quiz Details & Marks</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProfiles.length > 0 ? (
                        filteredProfiles.map(s => (
                            <tr key={s.email}>
                                <td>{s.name}</td>
                                <td>{s.email}</td>
                                <td>
                                    {s.quizResults && s.quizResults.length > 0 ? (
                                        s.quizResults.map((r, index) => (
                                            <div key={index} className="result-item">
                                                {r.quizNo}: <b>{r.score}/{r.total}</b> ({r.passed ? "✅" : "❌"})
                                            </div>
                                        ))
                                    ) : (
                                        <span style={{ color: "#94a3b8" }}>No quizzes attempted yet</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" style={{ textAlign: "center" }}>
                                {searchTerm
                                    ? `No results found for "${searchTerm}"`
                                    : "No student data available."}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Protected() {
  const [account, setAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("faceAuth")) {
      navigate("/login");
    }

    const { account } = JSON.parse(localStorage.getItem("faceAuth"));
    setAccount(account);
  }, []);

  useEffect(() => {
    // Fetch users from backend
    fetch(`https://5d00-105-163-156-111.ngrok-free.app/api/users`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const filteredRows = data.filter(
          user =>
            !["00", "11", "22"].includes(
              (user.studentId || "").toLowerCase()
            )
        );
        setAccounts(filteredRows);
        if (data.length > 0) {
          console.log(data);
          // setSelected(data[0]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        // setErrorMessage('Failed to load users. Please try again later.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Fetch users from backend
    fetch(`https://5d00-105-163-156-111.ngrok-free.app/api/logs`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        
        setLogs(data);
        if (data.length > 0) {
          console.log(data);
          // setSelected(data[0]);
        }
        setLoadingLogs(false);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        // setErrorMessage('Failed to load users. Please try again later.');
        setLoadingLogs(false);
      });
  }, []);

  if (!account) {
    return null;
  }

  const formatTimeToLocal = (timestamp) => {
    if (!timestamp) return 'Not checked in';
    
    const date = new Date(timestamp);
    
    // Format to local timezone with readable format
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // Use 24-hour format, set to true for 12-hour
    });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="w-full bg-white shadow flex items-center justify-between px-8 py-4">
        {/* Left: Profile Picture and Name */}
        <div className="flex items-center gap-4">
          <img
            className="object-cover h-12 w-12 rounded-full"
            src={account.picture }
            alt={account.fullName}
          />
          <span className="text-lg font-bold text-gray-900">{account?.fullName}</span>
        </div>
        {/* Right: Logout Button */}
        <div
          onClick={() => {
            localStorage.removeItem("faceAuth");
            navigate("/");
          }}
          className="flex items-center gap-2 cursor-pointer z-10 py-2 px-5 rounded-full bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 transition"
        >
          <span className="text-white font-medium">Log Out</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="white"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
        </div>
      </nav>
      {/* Main Content */}
      {["admin", "teacher", "principal"].includes(
        (account?.fullName || "").toLowerCase()
      ) ? (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Students List</h2>
            <button
              className="inline-flex items-center gap-2 rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
              onClick={() => {
                localStorage.removeItem("faceAuth");
                window.location.href = "/user-select";
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add Student
            </button>
          </div>
          <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr>
                  <th className="px-3 py-2 bg-gray-100">Name</th>
                  <th className="px-3 py-2 bg-gray-100">Reg No</th>
                  <th className="px-3 py-2 bg-gray-100">ID</th>
                  
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-3 py-4 text-center text-gray-500">
                      Loading students...
                    </td>
                  </tr>
                ) : accounts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-3 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  accounts.map((student, idx) => (
                    <tr key={student.id || idx} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{student.fullName}</td>
                      <td className="px-3 py-2">{student.studentId || 'N/A'}</td>
                      <td className="px-3 py-2">{student.id}</td>
                      
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mb-4 mt-6">
            <h2 className="text-2xl font-bold text-gray-900">Attendace Log</h2>
          </div>
          <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr>
                <th className="px-3 py-2 bg-gray-100">Name</th>
                <th className="px-3 py-2 bg-gray-100">Reg No</th>
                <th className="px-3 py-2 bg-gray-100">ID</th>
                <th className="px-3 py-2 bg-gray-100">Time In</th>
              </tr>
            </thead>
            <tbody>
              {loadingLogs ? (
                <tr>
                  <td colSpan="4" className="px-3 py-4 text-center text-gray-500">
                    Loading students...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-3 py-4 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((student, idx) => (
                  <tr key={student.id || idx} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">{student.fullName}</td>
                    <td className="px-3 py-2">{student.studentId || 'N/A'}</td>
                    <td className="px-3 py-2">{student.id}</td>
                    <td className="px-3 py-2">
                      {formatTimeToLocal(student.timeIn)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>

        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student Profile Card */}
            <div className="col-span-1 bg-gray-50 rounded-xl shadow p-6 flex flex-col items-center">
              <img
                className="object-cover h-28 w-28 rounded-full border-4 border-blue-200 mb-4"
                src={
                  account?.type === "CUSTOM"
                    ? account.picture
                    : `${account.picture}`
                }
                alt={account.fullName}
              />
              <h2 className="text-xl font-bold text-gray-900 mb-1">{account?.fullName}</h2>
              <p className="text-gray-600 mb-2">{account?.email || "student@email.com"}</p>
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full mb-2">
                {"ID: "+account?.studentId || "ID: 20240001"}
              </span>
              <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                {"Program: "+ account?.program || "N/A"}
              </span>
            </div>

            {/* Academic Info */}
            <div className="col-span-2 bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Academic Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700">Level:</span>{" "}
                    <span className="text-gray-900">{account?.level || "300"}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700">GPA:</span>{" "}
                    <span className="text-gray-900">{account?.gpa || "3.75"}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700">Status:</span>{" "}
                    <span className="text-green-600 font-semibold">{account?.status || "Active"}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700">Session:</span>{" "}
                    <span className="text-gray-900">{account?.session || "2023/2024"}</span>
                  </div>
                </div>
                <div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700">Department:</span>{" "}
                    <span className="text-gray-900">{account?.department || "Computer Science"}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700">Faculty:</span>{" "}
                    <span className="text-gray-900">{account?.faculty || "Science"}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700">Advisor:</span>{" "}
                    <span className="text-gray-900">{account?.advisor || "Dr. Jane Doe"}</span>
                  </div>
                </div>
              </div>
              {/* Recent Grades Table */}
              <div className="mt-8">
                <h4 className="text-md font-semibold text-gray-700 mb-2">Recent Grades</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 bg-gray-100">Course</th>
                        <th className="px-3 py-2 bg-gray-100">Code</th>
                        <th className="px-3 py-2 bg-gray-100">Grade</th>
                        <th className="px-3 py-2 bg-gray-100">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(account?.grades || [
                        { course: "Data Structures", code: "CSC301", grade: "A", credit: 3 },
                        { course: "Operating Systems", code: "CSC305", grade: "B+", credit: 3 },
                        { course: "Database Systems", code: "CSC307", grade: "A-", credit: 2 },
                      ]).map((g, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="px-3 py-2">{g.course}</td>
                          <td className="px-3 py-2">{g.code}</td>
                          <td className="px-3 py-2">{g.grade}</td>
                          <td className="px-3 py-2">{g.credit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Protected;

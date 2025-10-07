import React, { useState , useEffect} from "react";
import User from "../components/User";
import { RadioGroup } from "@headlessui/react";
import { Link } from "react-router-dom";
import { getApiUrl } from '../utils/environment';



function UserSelect() {
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [studentName, setStudentName] = useState();
  const [studentId, setStudentId] = useState();
  const [customUser, setCustomUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  
  const apiUrl = getApiUrl();
  
  const handleUserSelect = (user, event) => {
    // Prevent the default RadioGroup behavior
    event?.stopPropagation();
    
    // If user is an admin, skip location selection
    if (user.role === "admin" || userRole === "admin") {
      setSelected(user);
      setShowLocationModal(false);
      setErrorMessage('');
      return;
    }
    
    // For non-admin users, show location selection
    setPendingUser(user);
    setShowLocationModal(true);
  };
  
  const handleLocationSelect = (locationId) => {
    const location = locations.find(loc => loc.id === locationId);
    setSelectedLocation(locationId);
    setShowLocationModal(false);
    
    // If we have a pending user, select it after location is chosen
    if (pendingUser) {
      // Update the pending user with the selected location
      const userWithLocation = {
        ...pendingUser,
        location_id: locationId,
        location_name: location?.location_name || ''
      };
      setSelected(userWithLocation);
      setPendingUser(null);
    }
  };
  
  const LocationModal = () => (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        // Close modal if clicking on the backdrop
        if (e.target === e.currentTarget) {
          setShowLocationModal(false);
          setErrorMessage('Please select a location to continue');
        }
      }}
    >
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-medium mb-4">Select Location</h3>
        <p className="text-sm text-gray-600 mb-4">Please select a location for {pendingUser?.fullName}</p>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {locations.length === 0 ? (
            <p className="text-gray-500 text-sm">No locations available</p>
          ) : (
            locations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleLocationSelect(location.id)}
                className="w-full text-left px-4 py-3 bg-white border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 rounded-md transition-colors duration-200"
              >
                <div className="font-medium">{location.location_name}</div>
                <div className="text-sm text-gray-500">{location.location_abrv}</div>
              </button>
            ))
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setShowLocationModal(false);
              setErrorMessage('Please select a location to continue');
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
  
  // export const config = getConfig();
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fullUrl = `${apiUrl}/api/users`;
        console.log('API URL:', apiUrl);
        console.log('Full URL:', fullUrl);
        console.log('Current window location:', window.location.href);
        
        const response = await fetch(fullUrl, {
          headers: {
            
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        console.log('Response URL:', response.url);
        console.log('Content-Type:', response.headers.get('content-type'));
        
        // Get the actual response text to see what you're receiving
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        // Try to parse as JSON only if it looks like JSON
        if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
          console.log('Response URL looks like JSON');
          const data = JSON.parse(responseText);
          setAccounts(data);
          if (data.length > 0) {
            setSelected(data[0]);
          }
        } else {
          throw new Error('Response is not JSON: ' + responseText.substring(0, 100));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setErrorMessage('Failed to load users. Please try again later.');
        setLoading(false);
      }
    };

    const fetchLocations = async () => {
      try {
        const fullUrl = `${apiUrl}/api/locations`;
        console.log('Fetching locations from:', fullUrl);
        
        const response = await fetch(fullUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Locations fetched:', data);
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
        // Don't set error message for locations as it's not critical
      }
    };
  
    fetchUsers();
    fetchLocations();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <p className="text-red-500">{errorMessage}</p>
        <button 
          onClick={() => window.location.href = '/'} 
          className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-[24px] w-full max-w-[720px] mx-auto">
      <h1 className="text-2xl font-semibold">Log In</h1>
      <div className="w-full p-4 text-right">
        <div className="mx-auto w-full max-w-md">
          <RadioGroup value={selected} onChange={handleUserSelect} className="space-y-4">
            <RadioGroup.Label className="sr-only">Server size</RadioGroup.Label>
            {accounts.map((account) => (
              <User 
                key={account.id} 
                user={account} 
                type={account.type} 
                onClick={(e) => handleUserSelect(account, e)}
              />
            ))}
            {showLocationModal && <LocationModal />}
            {customUser && (
              <div className="relative">
                <User key={customUser.id} user={customUser} type="CUSTOM" />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="text-indigo-800 w-6 h-6 absolute top-1/2 -translate-y-1/2 right-[-32px] cursor-pointer"
                  onClick={() => {
                    setCustomUser(null);
                    selected?.type === "CUSTOM" && setSelected(accounts[0]);
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}
          </RadioGroup>
          {!customUser && (
            <div className="flex flex-col items-center justify-center w-full mt-3">
              <h1 className="text-2xl font-semibold">New Student</h1>

              <div className="flex gap-4 mb-4">
                
                <div className="flex-1">
                  <input
                    id="student-name"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter student name"
                  />
                </div>

                <div className="flex-1">
                  <input
                    id="student-id"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter student ID"
                  />
                </div>

                <div className="flex-1">
                  <select
                    id="user-role"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select role</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <select
                    id="location"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select location</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.location_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:border-indigo-200 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center py-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-indigo-500 mb-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                    />
                  </svg>
                  <p className="font-semibold mb-2 text-sm text-gray-500 dark:text-gray-400">
                    Click to upload image 
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG or JPEG
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  className="hidden"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (files == null || files.length == 0) {
                      setErrorMessage("No files wait for import.");
                      return;
                    }

                    if (!studentName.trim()) {
                      setErrorMessage("Please enter the student's name.");
                      return;
                    }

                    if (!studentId.trim()) {
                      setErrorMessage("Please enter the student's ID.");
                      return;
                    }

                    if (!selectedLocation && userRole !== "admin") {
                      setErrorMessage("Please select a location.");
                      return;
                    }

                    let file = files[0];
                    let name = file.name;
                    let suffixArr = name.split("."),
                      suffix = suffixArr[suffixArr.length - 1];
                    let nameWithoutSuffix = name.split(".")[0];

                    if (!["png", "jpg", "jpeg"].includes(suffix)) {
                      setErrorMessage("Only PNG, JPG, or JPEG files are supported.");
                      return;
                    }

                    if (file.size > 5 * 1024 * 1024) {
                      setErrorMessage("File size must be less than 5MB.");
                      return;
                    }

                    function generateId(length = 20) {
                      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                      let result = '';
                      for (let i = 0; i < length; i++) {
                        result += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      return result;
                    }
                    const autogeneratedId = generateId(20);

                    // const base64 = await convertBase64(file);

                    // const user = {
                    //   id: "custom",
                    //   fullName: nameWithoutSuffix,
                    //   type: "CUSTOM",
                    //   picture: base64,
                    // };
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('userData', JSON.stringify({
                      id: autogeneratedId,
                      studentId: studentId.trim(),
                      fullName: studentName.trim(),
                      program: userRole,
                      type: "CUSTOM",
                      email: nameWithoutSuffix + '@gmail.com',
                      location_id: selectedLocation
                    }));

                    // setCustomUser(user);
                    // setSelected(user);
                    try {
                      const response = await fetch(`${apiUrl}/api/addusers`, {
                        method: 'POST',
                        body: formData, 
                      });
                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Network response was not ok');
                      }

                      const createdUser = await response.json();
                      
                      console.log("Created user:", createdUser);
                      setCustomUser(createdUser);
                      setSelected(createdUser);
                    } catch (error) {
                      console.error('Error creating user:', error);
                      setErrorMessage(`Failed to create user: ${error.message}`);
                    }
                  }}
                />
              </label>
              {errorMessage && (
                <p className="text-red-500 text-xs mt-2">{errorMessage}</p>
              )}
            </div>
          )}
          <Link
            to="/login"
            state={{ 
              account: selected, 
              location_id: selected?.location_id || selectedLocation,
              location_name: selected?.location_name || locations.find(loc => loc.id === selectedLocation)?.location_name || ''
            }}
            className={`mt-4 inline-flex items-center rounded-md px-4 py-2.5 text-sm font-medium shadow-sm transition-colors duration-200 ${
              (selected || customUser) 
                ? (selectedLocation || selected?.role === 'admin' || userRole === 'admin' 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-indigo-100 text-indigo-400 cursor-not-allowed')
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            onClick={(e) => {
              if (!selected && !customUser) {
                e.preventDefault();
                setErrorMessage('Please select a user or create a new one');
              } else if (!selectedLocation && !(selected?.role === 'admin' || userRole === 'admin')) {
                e.preventDefault();
                setShowLocationModal(true);
                setErrorMessage('Please select a location to continue');
              }
            }}
          >
            Continue
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="ml-1.5 h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserSelect;

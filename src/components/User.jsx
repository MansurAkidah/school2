import { RadioGroup } from "@headlessui/react";
import { getImageUrl } from "../utils/imageUtils";

function User({ user, type, onClick }) {
  console.log("user-=-",user)
  return (
    <RadioGroup.Option
      key={user.id}
      value={user}
      onClick={onClick}
      className={({ active, checked }) =>
        `${
          checked 
            ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2' 
            : active 
              ? 'bg-indigo-50' 
              : 'bg-white'
        } relative flex cursor-pointer rounded-lg px-5 py-4 shadow-sm hover:bg-indigo-50 transition-colors duration-200`
      }
    >
      {({ checked }) => (
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center">
            <div className="text-sm">
              <RadioGroup.Label
                as="div"
                className={`flex items-center gap-x-6 font-medium ${
                  checked ? 'text-white' : 'text-gray-900'
                }`}
              >
                <img
                  className="object-cover h-10 w-10 rounded-full"
                  src={getImageUrl(user.picture)}
                  alt={user.fullName}
                />
                {user.fullName}
              </RadioGroup.Label>
            </div>
          </div>
          {checked && (
            <div className="shrink-0 text-white">
              <CheckIcon className="h-6 w-6" />
            </div>
          )}
        </div>
      )}
    </RadioGroup.Option>
  );
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
      <path
        d="M7 13l3 3 7-7"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default User;

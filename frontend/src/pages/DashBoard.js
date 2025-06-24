import { DivideIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

function DashBoard(){
    return(

        <div className="flex items-center justify-center text-white">
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-xl">
            <PlusCircleIcon className="w-5 h-5" />
            Log issue
        </button>
        </div>

    );
}

export default DashBoard;

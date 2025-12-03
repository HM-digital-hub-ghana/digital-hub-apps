import { Search } from 'lucide-react'
import  { useState } from 'react'

export default function AdminSearchBar() {
    const [, setAdminSearch]=useState("")
  return (
    <div>
        <div className='flex  bg-white items-center h-[43px] w-[320px] border border-gray-200 rounded-xl '>
            <Search className='w-3 absolute ml-3 text-[#99A1AF]'/>
            <div className='w-full h-full'>
                <input type="search" className='h-full w-full pl-8 text-[14px]' onChange={(e)=>{setAdminSearch(e.target.value)}} placeholder='Search by employee or room' />
            </div>

        </div>
    </div>
  )
}
 
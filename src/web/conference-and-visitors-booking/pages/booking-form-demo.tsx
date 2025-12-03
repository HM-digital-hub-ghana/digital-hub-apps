import { BookingForm } from "@web/components/BookingForm"

export default function BookingFormDemo() {
  const handleSubmit = (data: any) => {
    console.log("Form submitted:", data)
  }

  const handleCancel = () => {
    console.log("Form cancelled")
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <BookingForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  )
}


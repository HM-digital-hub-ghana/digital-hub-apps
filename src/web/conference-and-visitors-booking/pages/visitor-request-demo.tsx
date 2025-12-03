
import VisitorRequestForm from "@web/components/VisitorRequestForm"

export default function VisitorRequestDemo() {
  const handleSubmit = (data: any) => {
    console.log("Visitor request submitted:", data)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Visitor Request Form Demo
          </h1>
          <p className="text-gray-600">
            Test the VisitorRequestForm component
          </p>
        </div>
        
        <VisitorRequestForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}


import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { UserPlus, User, Plus, X, CalendarIcon } from "lucide-react"
import toast from "react-hot-toast"
import {
  apiGetPurposeTypes,
  apiGetAllVisitors,
  apiRegisterVisitor,
  apiScheduleVisit,
  type Visitor,
} from "@web/conference-and-visitors-booking/service/visitors"

import { Button } from "@web/components/ui/button"
import { Input } from "@web/components/ui/input"
import { Textarea } from "@web/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@web/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@web/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@web/components/ui/popover"
import { Calendar as CalendarComponent } from "@web/components/ui/calendar"
import { Card } from "@web/components/ui/card"
import { cn, handleApiError } from "@/lib/utils"

// Zod schema for form validation
const visitorSchema = z.object({
  visitor_id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  badgeType: z.string().min(1, "Badge type is required"),
})

const visitorRequestSchema = z.object({
  visitDate: z.date({
    message: "Visit date is required",
  }),
  visitTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time"),
  endTime: z.union([
    z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time"),
    z.literal(""),
  ]).optional(),
  purposeOfVisit: z.string().optional(),
  visitors: z.array(visitorSchema).min(1, "At least one visitor is required"),
})

type VisitorRequestFormData = z.infer<typeof visitorRequestSchema>

interface VisitorRequestFormProps {
  onSubmit?: (data: VisitorRequestFormData) => void
  defaultValues?: Partial<VisitorRequestFormData>
  isLoading?: boolean
}



export default function VisitorRequestForm({
  onSubmit,
  defaultValues,
  isLoading: externalIsLoading = false,
}: VisitorRequestFormProps) {
  const [allVisitors, setAllVisitors] = useState<Visitor[]>([])
  const [purposeTypes, setPurposeTypes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingPurposeTypes, setLoadingPurposeTypes] = useState(true)
  const [selectedVisitorIndex, setSelectedVisitorIndex] = useState<number | null>(null)

  const form = useForm<VisitorRequestFormData>({
    resolver: zodResolver(visitorRequestSchema),
    defaultValues: {
      visitDate: undefined,
      visitTime: "",
      endTime: "",
      purposeOfVisit: "",
      visitors: [
        {
          name: "",
          email: "",
          phone: "",
          company: "",
          badgeType: "",
        },
      ],
      ...defaultValues,
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingPurposeTypes(true)
        const [types, visitors] = await Promise.all([
          apiGetPurposeTypes(),
          apiGetAllVisitors(),
        ])
        setPurposeTypes(types)
        setAllVisitors(visitors)
      } catch (error) {
        const errorMessage = handleApiError(
          error,
          "Failed to load visitor data. Please try again.",
          "VisitorRequestForm.fetchData"
        )
        toast.error(errorMessage)
      } finally {
        setLoadingPurposeTypes(false)
      }
    }

    fetchData()
  }, [])

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "visitors",
  })

  const transformTimeToISO = (date: Date, timeString: string): string => {
    const [hours, minutes] = timeString.split(":").map(Number)
    const dateTime = new Date(date)
    dateTime.setHours(hours, minutes, 0, 0)
    return dateTime.toISOString()
  }

  const handleSubmit = async (data: VisitorRequestFormData) => {
    setIsLoading(true)

    try {
      const visitorIds: number[] = []

      for (const visitor of data.visitors) {
        let visitorId: number

        if (visitor.visitor_id) {
          visitorId = visitor.visitor_id
        } else {
          const registerPayload = {
            name: visitor.name,
            email: visitor.email || undefined,
            company: visitor.company || undefined,
            phone: visitor.phone || undefined,
            purpose_type: visitor.badgeType,
          }

          const registerResponse = await apiRegisterVisitor(registerPayload)
          visitorId = registerResponse.data.visitor.id
        }

        visitorIds.push(visitorId)
      }

      const scheduledDate = transformTimeToISO(data.visitDate, data.visitTime)
      const endTime = data.endTime ? transformTimeToISO(data.visitDate, data.endTime) : undefined

      const schedulePromises = data.visitors.map((visitor, index) => {
        const schedulePayload = {
          visitor_id: visitorIds[index],
          purpose: data.purposeOfVisit || "",
          purpose_type: visitor.badgeType,
          scheduled_date: scheduledDate,
          ...(endTime && { end_time: endTime }),
        }
        return apiScheduleVisit(schedulePayload)
      })

      await Promise.all(schedulePromises)

      toast.success(`Successfully scheduled visit for ${data.visitors.length} visitor(s)!`)
      form.reset()
      onSubmit?.(data)
    } catch (error) {
      const errorMessage = handleApiError(
        error,
        "Failed to submit visitor request. Please try again.",
        "VisitorRequestForm.handleSubmit"
      )
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredVisitors = (searchTerm: string): Visitor[] => {
    if (!searchTerm || searchTerm.length < 2) return []
    const term = searchTerm.toLowerCase()
    return allVisitors.filter((visitor) =>
      visitor.name.toLowerCase().includes(term)
    )
  }

  const handleVisitorSelect = (visitor: Visitor, index: number) => {
    form.setValue(`visitors.${index}.visitor_id`, visitor.id)
    form.setValue(`visitors.${index}.name`, visitor.name)
    form.setValue(`visitors.${index}.email`, visitor.email || "")
    form.setValue(`visitors.${index}.phone`, visitor.phone || "")
    form.setValue(`visitors.${index}.company`, visitor.company || "")
    form.setValue(`visitors.${index}.badgeType`, visitor.purpose_type)
    setSelectedVisitorIndex(null)
  }

  const addVisitor = () => {
    append({
      name: "",
      email: "",
      phone: "",
      company: "",
      badgeType: purposeTypes[0] || "",
    })
  }

  const removeVisitor = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const visitorCount = fields.length

  return (
    <div className="bg-white border-[#ababab] rounded-[10px] w-full flex flex-col h-full overflow-hidden">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 min-w-0 min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[rgba(2,77,44,0.1)] rounded-full p-2.5">
                <UserPlus className="w-5 h-5 text-[#024d2c]" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-950">
                Visitor Request
              </h2>
            </div>
            <div className="text-sm text-[#717182]">
              {visitorCount} Visitor{visitorCount !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Visit Details Section */}
          <div className="space-y-4 pb-4">
            <h3 className="text-sm font-semibold text-[#717182] uppercase tracking-wide">
              Visit Details
            </h3>
            
            {/* Visit Date - Top left, half width */}
            <div className="w-[210px]">
              <FormField
                control={form.control}
                name="visitDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-950">
                      Visit Date *
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-9 border-[#ababab] text-left font-normal justify-start w-[210px]",
                              !field.value && "text-[#717182]"
                            )}
                          >
                            <CalendarIcon className="w-4 h-4 text-[#024d2c] mr-2" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span className="text-[#717182]">Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[350px] p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date:Date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Start Time and End Time - Same line below Visit Date, aligned to right */}
            <div className="flex gap-10 max-w-[580px]">
              <div className="w-[210px]">
                <FormField
                  control={form.control}
                  name="visitTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-950">
                        Start Time *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          step="60"
                          className="h-9 border-[#ababab] w-[210px] bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-[210px]">
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-950">
                        End Time
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          step="60"
                          className="h-9 border-[#ababab] w-[210px] bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Purpose of Visit */}
            <FormField
              control={form.control}
              name="purposeOfVisit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-950">
                    Purpose of Visit
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of visit purpose"
                      className="min-h-[80px] border-[#ababab] text-sm placeholder:text-[#717182] w-full max-w-[580px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Visitor Information Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#717182] uppercase tracking-wide">
                Visitor Information
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVisitor}
                className="border-[rgba(2,77,44,0.3)] text-[#024d2c] hover:bg-[rgba(2,77,44,0.05)]"
              >
                <Plus className="w-4 h-4 mr-2 text-[#024d2c]" />
                Add Visitor
              </Button>
            </div>

            {/* Visitor Cards */}
            <div className="space-y-3">
              {fields.map((field, index) => (
                <Card key={field.id} className="border-[#ababab] p-4">
                  <div className="space-y-4">
                    {/* Visitor Card Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-[rgba(2,77,44,0.1)] rounded-full p-2">
                          <User className="w-4 h-4 text-[#024d2c]" />
                        </div>
                        <span className="font-semibold text-neutral-950">
                          Visitor {index + 1}
                        </span>
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeVisitor(index)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Visitor Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <FormField
                        control={form.control}
                        name={`visitors.${index}.name`}
                        render={({ field }) => {
                          const nameValue = field.value || ""
                          const filteredVisitors = getFilteredVisitors(nameValue)
                          const showSuggestions = filteredVisitors.length > 0 && nameValue.length >= 2 && selectedVisitorIndex === index

                          return (
                            <FormItem className="relative">
                              <FormLabel className="text-sm font-medium text-neutral-950">
                                Name *
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="Start typing name to search..."
                                    className="h-9 border-[#ababab] placeholder:text-[#717182] w-full"
                                    {...field}
                                    onFocus={() => setSelectedVisitorIndex(index)}
                                    onChange={(e) => {
                                      field.onChange(e)
                                      setSelectedVisitorIndex(index)
                                    }}
                                  />
                                  {showSuggestions && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-[#ababab] rounded-md shadow-lg max-h-48 overflow-auto">
                                      {filteredVisitors.map((visitor) => (
                                        <div
                                          key={visitor.id}
                                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                          onClick={() => {
                                            handleVisitorSelect(visitor, index)
                                            setSelectedVisitorIndex(null)
                                          }}
                                        >
                                          <div className="font-medium text-sm">{visitor.name}</div>
                                          {visitor.email && (
                                            <div className="text-xs text-gray-500">{visitor.email}</div>
                                          )}
                                          {visitor.company && (
                                            <div className="text-xs text-gray-500">{visitor.company}</div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )
                        }}
                      />

                      {/* Email */}
                      <FormField
                        control={form.control}
                        name={`visitors.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-neutral-950">
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="email@example.com"
                                className="h-9 border-[#ababab] placeholder:text-[#717182] w-full"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Phone */}
                      <FormField
                        control={form.control}
                        name={`visitors.${index}.phone`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-neutral-950">
                              Phone
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="Phone number"
                                className="h-9 border-[#ababab] placeholder:text-[#717182] w-full"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Company */}
                      <FormField
                        control={form.control}
                        name={`visitors.${index}.company`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-neutral-950">
                              Company
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Company name"
                                className="h-9 border-[#ababab] placeholder:text-[#717182] w-full"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Badge Type */}
                      <FormField
                        control={form.control}
                        name={`visitors.${index}.badgeType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-neutral-950">
                              Badge Type
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={loadingPurposeTypes}>
                              <FormControl>
                                <SelectTrigger className="h-9 border-[#ababab] w-full">
                                  <SelectValue placeholder={loadingPurposeTypes ? "Loading..." : "Select badge type"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {purposeTypes.length > 0 ? (
                                  purposeTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="none" disabled>
                                    No badge types available
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button - Fixed at bottom */}
        <div className="flex-shrink-0 bg-white px-4 py-4 border-t border-[#ababab] relative z-10">
          <Button
            type="submit"
            className="w-full bg-[#024d2c] hover:bg-[#024d2c]/90 text-white h-9"
            disabled={isLoading || externalIsLoading || loadingPurposeTypes}
          >
            {isLoading || externalIsLoading
              ? "Submitting..."
              : `Submit Request for ${visitorCount} Visitor${visitorCount !== 1 ? "s" : ""}`
            }
          </Button>
        </div>
        </form>
      </Form>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FiChevronDown } from 'react-icons/fi'

gsap.registerPlugin(ScrollTrigger)

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null)
  const faqsRef = useRef(null)

  useEffect(() => {
    // Ensure FAQs are visible immediately
    if (faqsRef.current) {
      Array.from(faqsRef.current.children).forEach((child) => {
        if (child.style) {
          child.style.opacity = '1'
          child.style.visibility = 'visible'
        }
      })
    }
  }, [])

  const faqs = [
    {
      question: 'How do I book a travel package?',
      answer: 'You can browse our packages on the Packages page, select your preferred package, and click "Book Now". Fill in the booking form with your details and passenger information.'
    },
    {
      question: 'What is the booking process?',
      answer: 'After submitting your booking form, you will receive a confirmation email. Our team will review your booking and confirm the details. You will be notified once your booking is confirmed.'
    },
    {
      question: 'Can I customize my trip?',
      answer: 'Yes! You can submit a custom trip request through the Custom Trip Request page. Our team will review your requirements and get back to you with a customized itinerary.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'Currently, we accept bookings through our platform. Payment details will be shared after booking confirmation.'
    },
    {
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel your booking. Please contact our support team for cancellation policies and procedures.'
    },
    {
      question: 'How many passengers can I book for?',
      answer: 'You can book for 1 to 20 passengers in a single booking. Each passenger must provide their details including name, date of birth, and gender.'
    },
    {
      question: 'Do I need to create an account to book?',
      answer: 'Yes, you need to register and create an account. After registration, you will receive an OTP for verification, and your account will be approved by our admin team.'
    },
    {
      question: 'What happens after I register?',
      answer: 'After registration, you will receive an OTP via email. Once verified, your account will be pending admin approval. You will receive an email notification once your account is approved.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">Frequently Asked Questions</h1>

        <div ref={faqsRef} className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-4 md:px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors text-left"
              >
                <span className="font-semibold pr-4">{faq.question}</span>
                <FiChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-4 md:px-6 pb-4 text-gray-600 leading-relaxed">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FAQs

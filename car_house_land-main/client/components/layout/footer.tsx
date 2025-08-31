import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">MasGebeya PLC</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted platform for buying, selling, and renting vehicles, properties, and land in Ethiopia.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/cars" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Cars
              </Link>
              <Link href="/houses" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Properties
              </Link>
              <Link href="/lands" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Lands
              </Link>
              <Link href="/machines" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Machines
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Support</h4>
            <div className="space-y-2">
              <Link href="/contact" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Contact Us
              </Link>
              <Link href="/support" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Help Center
              </Link>
              <Link href="/consultation" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Consultation
              </Link>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">+251 911 123 456</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">info@MasGebeya.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">© 2025 MasGebeya PLC . All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

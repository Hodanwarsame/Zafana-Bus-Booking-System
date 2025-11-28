# authicate, permission, token, status, response, generics, apiviews
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework import status, generics
from rest_framework.views import APIView
from .serializers import UserRegisterSerializer, BusSerializer, BookingSerializer
from rest_framework.response import Response
from .models import Bus, Seat, Booking
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django_daraja.mpesa.core import MpesaClient
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Sum, Count, Q
from collections import defaultdict




@csrf_exempt
def stk_push_payment(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Invalid request method"}, status=400)

    try:
        import json
        body = json.loads(request.body)

        phone = body.get("phone")
        amount_raw = body.get("amount")

        if not phone:
            return JsonResponse({"error": "Phone number is required"}, status=400)

        if not amount_raw:
            return JsonResponse({"error": "Amount is required"}, status=400)

        # Ensure amount is always a valid integer (minimum 1 for demo)
        try:
            amount = int(float(amount_raw))
            # Allow minimum 1 shilling for demo purposes
            if amount < 1:
                amount = 1
        except ValueError:
            return JsonResponse({"error": "Invalid amount format"}, status=400)

        #  Optional: Ensure phone starts with 254
        if phone.startswith("07"):
            phone = "254" + phone[1:]
        elif phone.startswith("01"):
            phone = "254" + phone[1:]
        elif not phone.startswith("+254"):
            return JsonResponse({"error": "Invalid phone number format"}, status=400)

        cl = MpesaClient()
        account_reference = "ZafananaBus"
        transaction_desc = "Bus Ticket Payment"
        callback_url = "https://betty-unisomeric-edwardo.ngrok-free.dev/api/mpesa/confirmation/"  # <-- CHANGE THIS

        response = cl.stk_push(
            phone, amount, account_reference, transaction_desc, callback_url
        )

        #  Make response always JSON serializable
        return JsonResponse(response, safe=False)

    except Exception as e:
        print("STK Push Error:", str(e))
        return JsonResponse({"error": "Server error", "details": str(e)}, status=500)


from django.http import JsonResponse

def mpesa_confirmation(request):
    if request.method == 'POST':
        # You can log or process incoming M-Pesa confirmation data here
        print("M-Pesa confirmation received:", request.body)
        return JsonResponse({"ResultCode": 0, "ResultDesc": "Accepted"})
    else:
        return JsonResponse({"error": "Invalid request method"}, status=400)

class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data= request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.id
            }, status= status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        # Try to get user by email
        try:
            from django.contrib.auth.models import User
            user = User.objects.get(email=email)
            # Authenticate with username (Django's authenticate uses username)
            user = authenticate(username=user.username, password=password)
        except User.DoesNotExist:
            user = None

        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token':token.key,
                'user_id': user.id
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error':'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class BusListCreateView(generics.ListCreateAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer

class BusDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer

class BookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        seat_id = request.data.get('seat')
        try:
            seat = Seat.objects.get(id = seat_id)
            if seat.is_booked:
                return Response({'error': 'Seat already booked'}, status=status.HTTP_400_BAD_REQUEST)

            seat.is_booked = True
            seat.save()

            bookings = Booking.objects.create(
                user = request.user,
                bus = seat.bus,
                seat = seat
            )
            serializer = BookingSerializer(bookings)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Seat.DoesNotExist:
            return Response({'error':'Invalid Seat ID'}, status=status.HTTP_400_BAD_REQUEST)
        
class UserBookingView(APIView):
    permission_classes= [IsAuthenticated]

    def get(self, request, user_id):
        if request.user.id != user_id:
            return Response({'error':'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        bookings = Booking.objects.filter(user_id= user_id)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get period parameter (default to 7d)
        period = request.query_params.get('period', '7d')
        
        # Calculate date range based on period
        now = timezone.now()
        if period == '7d':
            start_date = now - timedelta(days=7)
        elif period == '30d':
            start_date = now - timedelta(days=30)
        elif period == '90d':
            start_date = now - timedelta(days=90)
        else:
            start_date = now - timedelta(days=7)  # Default to 7 days
        
        # Filter bookings within the period
        bookings = Booking.objects.filter(booking_time__gte=start_date)
        
        # Calculate total bookings
        total_bookings = bookings.count()
        
        # Calculate total revenue (sum of all booking prices)
        total_revenue = sum(booking.price for booking in bookings)
        
        # Bus performance: group by bus
        bus_performance = []
        bus_stats = defaultdict(lambda: {'booking_count': 0, 'revenue': 0})
        
        for booking in bookings:
            bus = booking.bus
            bus_key = bus.id
            bus_stats[bus_key]['booking_count'] += 1
            bus_stats[bus_key]['revenue'] += float(booking.price)
            bus_stats[bus_key]['bus_name'] = bus.bus_name
            bus_stats[bus_key]['number'] = bus.number
        
        # Convert to list format
        for bus_id, stats in bus_stats.items():
            bus_performance.append({
                'bus_name': stats['bus_name'],
                'number': stats['number'],
                'booking_count': stats['booking_count'],
                'revenue': stats['revenue']
            })
        
        # Daily trends: group by day
        daily_trends = []
        daily_stats = defaultdict(lambda: {'count': 0, 'daily_revenue': 0})
        
        for booking in bookings:
            # Get the date part (without time)
            booking_date = booking.booking_time.date()
            daily_stats[booking_date]['count'] += 1
            daily_stats[booking_date]['daily_revenue'] += float(booking.price)
        
        # Convert to list format and sort by date
        for day, stats in sorted(daily_stats.items()):
            daily_trends.append({
                'day': day.isoformat(),  # Format as YYYY-MM-DD
                'count': stats['count'],
                'daily_revenue': stats['daily_revenue']
            })
        
        # Return dashboard data
        return Response({
            'total_bookings': total_bookings,
            'total_revenue': total_revenue,
            'bus_performance': bus_performance,
            'daily_trends': daily_trends
        })

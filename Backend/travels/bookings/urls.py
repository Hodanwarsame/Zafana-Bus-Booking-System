
from django.urls import path
from .views import RegisterView, LoginView, BusListCreateView, UserBookingView, BookingView, BusDetailView, DashboardView, admin_dashboard, revenue_report
from . import views
urlpatterns = [
    path('buses/', BusListCreateView.as_view(), name='buslist'),
    path('buses/<int:pk>/', BusDetailView.as_view(), name='bus-detail'),
    path('register/', RegisterView.as_view(), name = 'register'),
    path('login/', LoginView.as_view(), name = 'login'),
    path('user/<int:user_id>/bookings/', UserBookingView.as_view(), name="user-bookings"),
    path('booking/', BookingView.as_view(), name="booking"),
    path('admin/dashboard/', DashboardView.as_view(), name='dashboard'),
    path('daraja/stkpush/', views.stk_push_payment, name='stk_push_payment'),
    path('daraja/confirmation/', views.mpesa_confirmation, name='mpesa_confirmation'),
    # Simple HTML admin dashboard + CSV report (staff-only)
    path('admin-dashboard/', admin_dashboard, name='admin_dashboard_page'),
    path('admin-dashboard/report/', revenue_report, name='admin_dashboard_report'),
    
 
]

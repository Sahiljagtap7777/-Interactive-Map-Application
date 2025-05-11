from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    path('map/', views.map_view, name='map'),
    path('profile/', views.profile_view, name='profile'),
    # path('save-coordinates/', views.save_coordinates, name='save_coordinates'),
]
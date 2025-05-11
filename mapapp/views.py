from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from .forms import UserRegisterForm, UserLoginForm
from django.http import JsonResponse

# In views.py
def register(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            
            # Ensure profile exists
            from .models import UserProfile
            UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'company': form.cleaned_data['company'],
                    'position': form.cleaned_data['position']
                }
            )
            
            login(request, user)
            return redirect('map')
    else:
        form = UserRegisterForm()
    return render(request, 'mapapp/register.html', {'form': form})

def user_login(request):
    if request.method == 'POST':
        form = UserLoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('map')
    else:
        form = UserLoginForm()
    return render(request, 'mapapp/login.html', {'form': form})

@login_required
def user_logout(request):
    logout(request)
    return redirect('login')

@login_required
def map_view(request):
    return render(request, 'mapapp/map.html')

@login_required
def profile_view(request):
    return render(request, 'mapapp/profile.html', {'user': request.user})

# @login_required
# def save_coordinates(request):
#     if request.method == 'POST':
#         coordinates = request.POST.get('coordinates')
#         shape_type = request.POST.get('shape_type')
#         # Here you would typically save to database
#         return JsonResponse({'status': 'success', 'coordinates': coordinates})
#     return JsonResponse({'status': 'error'}, status=400)
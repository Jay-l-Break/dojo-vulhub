from django.http import HttpResponse
from .models import Collection

def vul(request):
    query = request.GET.get('order', default='id')
    q = Collection.objects.order_by(query)
    return HttpResponse(q.values())

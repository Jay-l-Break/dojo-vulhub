from django.http import HttpRequest, JsonResponse

from .models import Collection


def search_collections(request: HttpRequest) -> JsonResponse:
    key = request.GET.get('key', 'title')
    value = request.GET.get('value', '')
    names = list(
        Collection.objects.filter(**{'detail__' + key: value})
        .values_list('name', flat=True)
    )
    return JsonResponse({'collections': names})

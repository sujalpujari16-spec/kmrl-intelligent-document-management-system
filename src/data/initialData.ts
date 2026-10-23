import { DocumentItem, User, AuditLogItem, NotificationItem } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Sujal Pujari',
    role: 'Admin',
    email: 'admin@kmrl.in',
    department: 'IT & Digital Infrastructure',
    avatar: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAQDAwMDAgQDAwMEBAQFBgoGBgUFBgwICQcKDgwPDg4MDQ0PERYTDxAVEQ0NExoTFRcYGRkZDxIbHRsYHRYYGRj/2wBDAQQEBAYFBgsGBgsYEA0QGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBj/wAARCAE+AUADASIAAhEBAxEB/8QAHQAAAQUBAQEBAAAAAAAAAAAABAIDBQYHAQgACf/EAEEQAAEDAwMCBAQDBwMCBgIDAAECAxEABCEFEjEGQRMiUWEHcYGRFDKhFSNCscHR8FLh8TNiFiQlQ3KCFyeSssL/xAAbAQACAwEBAQAAAAAAAAAAAAACAwEEBQAGB//EACgRAAICAgIBBAIDAQEBAAAAAAABAhEDIQQSMQUTIkEyURRhcSMkFf/aAAwDAQACEQMRAD8AwQqPO4ge1NlfqZPFcUDtiO/emsyEgxXk0j1ti1LKQe9NLdWE5xXVLQZBP0FNqU2BgE/WpOOKeBOaQVmP5H+dfKc2ngCmlurmQZPuK5RsCTsWtajhXE9qQVqUqU/Wa7+Ld2wY2+4ptTwUYUE5PINH9Ugbo+kgcg+wpqVqVtTIJxA5r5zAKkSPtTQUrdKQRGf0qaoGw1q3ugEpSVAdiVQfrToub9hRAcURxBMio78Q8kkEEk5gim13DqgArHyxNSl9E9kiZb1u5KjuCVCacGtqCh4iPrM1ApcIbUOxjIk06CkgSJVE5Nd0ZHuNonk6wwpUbiPmIp1F+yoEeImPWq0XFJBhKR8gKaUpRG5Ss+oqeqZ3uOtlqW6MQQaO0pXiasgJIiDmqOHXAAUuKB+ZqzdHvOO60QoqKPDJn6iglHVhQyNujULACEx5Rxip22SCJPp96hbBIKQQJz61PMYSIBM/ekF9BjSQBzBnmikwBxPvQrSCcfyoxpsEgRk0S0dVikkwNsf2pQSomRJ96UAEpj9K6EkgwCKlSIo4BIyqklEmRTxEYgk0mCD5QaKwaGFIPcgfKmVNyc/pRDmDQ6lRAH60QLQwoHtPpQyhjg+9FKUcxE0wozMYoosgDeAKCBzUc6IOZj2qQfgpIHPrUc/KJ7xRxBeiMuR55AMVB6hhJKRg5qcdhRyYk/SoTUMTntnNMSsU97KV1OVK01QSkqUY/nVTatrxaNiLVZV2JH9atnUV0q1tvFaQFKkYImquNXvSpMu7SR2FMS0VMm2ODRL1RG9JA7SYpz9gPlad7qM9hmg1ajeecF9zPEGDSfx1yAqX1x2lXNTegOqXklP2AUTDgVHAPl/WgH9MvmFkptwe8pMmktXNy5513oaEj+Ik/apJvW7VptKStx4gRuKefemJ6FyknpE2pW4GDSFKVkBWK6rakYzP8qb3J/iTn1NZmkaTZ1apVETB4FMlKt42gmeYrviqH8Ig02XXCmConP2rmd2FKSpRIgDvMwaax+Un35pKySQCOO5ptSgDuABnBqQLdi1IWDO6R/213ypUBtM9pFM/vDwkyMeldHioHmcgehNHGNg/Y8XgJ2QJwDTBUUqUVEk/OkqVtI3LSccxmmi63uACCQOTU0zm0LIJViKSEKUkweKT44BENiYn1r5VwraAFhJ+XNSrQvsL2qnvxxFd2Kggkcd6HDjhmVEzxSVkggJIJj0iibJ8KwlZCYCSJ+eaa3JMyCZ7RSZUpUj5E8VwA8gBOZ5/z1qEdehzxEJUdiT65q1dDKDmqvDaPyfbPrVRhAUZWDOAM1cegUJ/aVyRmEDntM1GXUNBYb7I1bTxgQc1NsAEyEyah9NADYSR9anWSNoxxHIrPs10gppMEzxRKBKpOIplBxz24ohuSO00SZFULKeCT9qXgQa+SkJHrSiBExAokwWJJB4AxTZKuZntToHoPemykgmJ+dGgWMKyKYUSD2otQETTDoASc8+tEn9AsCcnnFDrUZx9RRa0SCAOaFdGJ/SjTB1QLcSVEj6x3qOuCNm0nJqReKcg8egqNfI3Gc+1HFi5Ea+oKTtUBHrUHf5JAMe0VM3BKc4A7feoO+V5TMyMe5pidANlH6qcUxbJSCJ3xCk7pqnu3BJylP0EZq1dWKSQylQUSVEiDjjvVYR4STBQDPfdNOi7RSzPdDO4iQR9PSkkiSRPfIFFF1ARsQ02lJOSEif1pPirV5Nx2xwPrTFVbEtMEVu2mJn1mlIJ3BIgD05j5V11tRb2+ESOfXFcZZdC96iEp9SQPpRqqFqk6L2XVJJPhpUBxJ4ptRKiVGE9ucCuKClJjB9YzSCgFMgT7k1j1Zq2fEoCZLk+kCmi41I5k+9d2jInnjPNNrKQRk4xNGtkWcLwgcARmc0146wBtWkg9wMRSLt5tln/AKZWT2A/nQDWrW0BCUBJAnJyadGDa0hbyJeWHl5Q/NuInma5JBJJPmxTAvAqzW+pvbH5TMTUanVlBcOKKv50SxSsD3ETMblD+H3iKaVtnjv6dqQLhJaStR27sQeRThQZG8gg8Vzi4+Tk0/AiEg5Cgf50kgflPJ9aXtQVf7UmUJVIB9Znioo5I5vCEQIkVwukn8/3HH+RSlBQSHC2kz6+vpX3irSidqQBzCa4nQnYtZIUFK9aWbd1KcpMEdzFNlxxWFFUGMzXxKyDkieT/ejToFyQsWygfMtCTzzxV0+Hg/8AU77j8qBMR61R0yCTIgDA7Ve/hw2FvXrhOZSk5+f96Vmvo2MwNuSs1exnYAkmYiamrdKokmZqKsQI5zU2yAYEiJrNb+jZQS0iRjvzRaR5eIphoJjkD2opIn8pgelcjmjkGSYJ9opeSMHPpSgAM18fmZpiAaExGT3pKh3jBxTpJ4imlA+nf1o1oChpY2iD60M9g+vyolfuKGXJwe9SnsgHcVHAz60E4SQfSjXD6EzQS5giPrTExbYC+VmSJqOeKlIImKkXiM/1qOuMe8frTosCRF3P/UiCflUJexsV+ueKmbkjcdvFQV6oQQCZjjmmJWLkzO+r1hK2GzPJOMGq+HgluUNACeJNSnW96LW9aQW0rlJIzxmqinVlBICLdEDJB75q5ixOUbRmcnIoyJoPqgDw0JA/7ZrhU8shRcVJ/wBOKhzrVwqT4KAe+TSVaxcEhOxs/wD1pqwyK/vqvJJuqdghRUTPrSGlKSslQAjtPvUc5q1xuACWx77Kctbx59ZKyDHZIrliaWyFlRpDiinnv2psqBOYH1pla8bioJ9SBTZeAJnIrG6NmvexbrzaUFa1AJ+1R9xqCA0SnOOKHVctXIWC6EhOUAp5qFccdaWQVHI4TVzFx7Vsr5c1aQarU3FrKEEpnyk+1dtrJgysq/eAcA4IoK2YDigrbEH7zR6kqdcQhsDaCRtFWmuqpFVty8j946g2iGoMRkgc+4oFVk4tBWlBIAmYzRTtyVOoQtMoQIIjg11N+yCUtrgKwVHvULRKdKgRPjOBFshUEEc4qQbK2rYJIUraYKhkChfEbW4UoE7RtmfoKbC7pLa7ZtKSlR4OIoJq1QUJJbRI+IUqmSO8Ec/TtXwWZ/N24igWrlaU+G+qSMBQondBncBHOKRLG0PjOx0uT5SkCKb8QgqiczSZAyViQZri1IIE/pUKIX9ClOLiEgkxk11KsDzbSMkU2FISsgSSewpYXCh+7kz3qWgYqvJ3xGwUiMnmO9aP8NUJNndrAUSXYk+gA/vWbb1DhtCe3Fah8MgpejvKPJfJJj2FI5HxgWOM/majYJ8scmfSpllPlgzUZYIAQO1S7QwKy7s2PIU0IISBPaikggexplCRIwTTyJJgY965Mih1PGY+1cgevbvSgMjB+9fKHrPvRxYNbG1ZFMFUEng0RHBMCmVtjIEfOmIFoYWVEgAT8qZdMH1FPykYgxTSwCOfpRJAsDcVAIECOaFWZz2HpRjkEkx/WgnIjIkU6ILQFdJkT681GPESRPapN1RjJmox/kwO/wAqNMTJkZdJJMk1Xb6ZImM5NWG5JG7OOaruoE+GriT39KZERIyXrqFa00JkbJg/Oqr+HGz86Y9hVm62cKtfSFRhsTHzNVzbuHfNa2C1BGNyn87EKt0BA/eA+wPNcS0FZkJ+Z5p8FpKCQkyc49K+UUkYPbinqRVoEeQEDyqmeYo3TEjwlkzzQb4ABABqQ0tITbFUkebMeldN/GzoJ9i6vOKAO6QTjcRUVfXS0jyzmpS7dKllQgZ4A5/w1DXd43ZgJWx4jsyFKHArGwwcnRtZZUtCEWN0nwrjekhRkAHjvUdcuTeKUo+aTmaQu9uHVKVuME4Ce1OotHnR4yh5ZI9uKv1GHkpfKW0KtrhaHZiR7d6kleK5feIyjaoAFKU9vegmkbGXFKgbRHFEaWvUb+6t7S2bKxO0JSOQTXSkq0TDHJumEw2m2WVKSHAZO7+LFDuDwm1uBvKREbe5rRNS6CudS09AsrZLdwlKQTMDiKX078LNUDi3tXKgCQQJ5NUFzcSVtmovS802uqMqZU8y8484kjcAIVRTjzi0bwkoAP5vetS6r6ItbOx8doElAlRAzWX6o5DnhNgJSDgHFPw8mOdfErcngz4jqf2R6ng95SYWnAMRUg0vcynlR9ZqN8NSmyVp2E5EiAaMs8WpJBJCoE4inTVorQnukFJKgDCZBzPpXylQIECeM0nft4TI4niuBwSAEII+VIpMsWKKyV/nABniulcgGVH3BopmwecWnchKQe0RApx1dpZPbVpKlDJIyBQ0d1+wRLbqyAlClqHoPtWqfDu4Ys9CDFw4ltwuKUErMEDtWd/tltm2KG2VIWRhcCIoMX63XZG8j/Uk5ApWbF7i6jMU1jlZ6hs9Qs0pE3LQIxhVT1q626AptwKHqDXkRN5qhbUu1uH0toOVJV5QfvU9oHxI13Q7htH4lTjKTCwrM1UfAaVpl6PPX2j1Y2M8CCaJQnGM/KqV0X15pPVNmkM3CU3YHnZ4PzFXVJkAxg8VTlBxdMuRyKatCwnE++K6U9z+tfDI5iukq7ioRI0oQimlBRMn7xTylZH9KaUSRnFMTBdgrgIHFDqgmSTI9aMcSDnHtQyxtn3piYFAjiYHBoNxJEyaLWSFQeIoZ07lZxnmaYmC2RlwrseB3FRrxgEmakbk7dx4+dRrpJbyBuNNQpoirpZyRIAHAqvagcnJAip+5Vgp9e1VvUFZUIIjM06KsrzMl6vUf/ErgwIAjFQSVDaJANS3VR3dT3EciB+lQoBSQAZHeK1sK+CMPku50ObgCQRk5pCtoMACOBnivt/mJPl9M0k+ZR2gH+tNSENjT2TH6DtUnpoV+D4MST86inckekelTFgNtkkJBkkkmuyL4k4/yLa4ZnakZ5FVu8ZL1+VLWQZ7jJqxKH8X5gaiNUQ4vakbQMwsDg1l8eVOma+dNxpCtN0xF7ehtmNoIJmtO0zpFhyxCizvWR5u01ReiGd1y4lZyk+lbFoLqUkI59veqvqGeUXSNf0bjRnFSl5Iq1+G+nXTm5afDbVktkVatB+H+iaQ+l+3bAdj8xHtU6y0taUqSgAYqftNPQlr8Tcq8NpIyTWRLk5GqPQrh4Y/JpAjWm2rDQDbe4kzIHJpF64lpvwvKFek5oLXetUt3P7O0CzS4TCS+vgfKqnf3TKLpP7S19lV06Y2Nq3Kk9gKB8Oc/k2c+bCGoxJC9LV4h22dG7cINYb1h01daNqS3lJK2VKJQqJ57VsulMMrcUti6dfCv9Q/yK+6i0ZGq6aWFI84ylVHx8z4uSr0DyuMuZitrf0Yb0voD3VvU1vpMrbR+ZZSPyj+5mtc6j+D2lab0nc3Fil5q7t0byHFSFxzP0mjfhVoarF26CtiXxdSp4JlQR2/rWs9WICtAfTdpAPhmXJjekpImrfI5snP4vSM/gemxhCprbPGi7IgRvAz70+zbNhUNkKe7qViB7Ut+58K4DyWJO4kJUfT+80G5rCVb1OQClBSPD/iV8/atfHjckmzzOasU2g60ULi9WjxtqSCgZgk+tcuNPt2ylT+oNMpSY3KMlR7wP71ANDUHXdlulfYQBxT72iajuC32Xlx7cU64xpMT1yy2ibNjYPsvLt7l55KO4SBOe/+d6i/AefvS20ja1OQBmKNs337ZkNt2RQO6lAmpND1oWSyHFIdIlZV5QZ7VDjF/icu3hkbcloJ8B0oaQMgFXAEcgVDPbVIWUrAHI96kXrFaluLEuEmAUpwBQF2h1Epc5GABS4Xew5STVI+07U7zTn0XVpcuNOpMhaDBr0Z8LvipbdQstaNrD4RqAEJUrh3/evM7aJSreuARRFldXOmalb31k+W32lBaFjsRxQ58Eci/snBnnjZ7tBBTJgivlEEwZ+tVnoPqVvqvoy11JJh3bsdHosDNWbK0AkAGTjnvg/asNxcW0z0GOSnHsJIPIjHFMLMyOJPNOq/MRTKzBgECpTJY0tQTQ7ipBIII5xTjm3jmKYXGwnNGmBQMtaVmQZjmhHpkwQPeilQkYHJnNCvrMHH0pq8gtEU+QVHmB3oB4+UicAUa/lcGTjmo64BPHuYpsWIloi7qSkntVa1CSCOIqw3apawc+hFVzUSfCjv9c1YiivMx7qRaV9R3ZSs4WRgcYqJwBAzic0fre5fUN2oeYl1UkjnNAE5gwOMVq4vxoxM8fmz5MbSO0Sa+wVf1HelZAO3780hQ4Ke5pyYhqhlaoVIHI+1S9mFJs0BQmQKiHTLkDPpU3Zoi0RgDH1oMzqJOKNyLMoK3+meZpm4SHGtqk7qMuBtWfLjuDQp7EfqKx06dm1LaOaJcL07U0FYhtz9a1HR9b06xSLi4XvWr8rYNZNdMh1IWglKxkEVcOk3mBp7d+8G3LkuhgeIJS3Jgk/52qc+KGVWyxweRPE+iNZ0f4gIdvEoXpoDEc1eEanaa9o7lq2sJIG6EqrIdLsha/EP8Jqtw5daUl5SlP24QEra2naRnB3RjsKmem0T1u5b2T7n4cklG/BKZxInniszkYVCPaJ6Hi5J5J9Zi9StFNLShIKbbxQl0IHmKZyB8x3pzUdL6e1vrH9saXYvWDCfDUlhCUolxCSlJG0SBB4nnNWs2LSLg+MZSTk1PWmjaSlDDqf4vU4+1VsXLbh1+zQy8GKl2ZE6L054Vkp5LAT3FR+r2gQowYI7dq05Rs7bTv3S0rG3I9KoOthp94lJE9wOKp5YtytlnE11pFS6euFWfVjuxJV4iPyATJ+XerJ8amNW6V0VdprVw2m4fYSva2vygHhI+VUu/ce0vVEXTDhQ6nhQ5FZP8Seqta1jqTbe379wlAhKVQEg+32FXuJx/fmrZn8zk/x05LxRS9V1Ny71DawjwxG2EfrVy6S6OTdpQ/dN7kkbvP8AyqqWOlruL5lakwJBXOa3PQWGreyt20p5HMRW7zMrxY0o+TyHp2BcnO5T2H6N0npzKQtuyRMckTVrZ6VbeYLi7VIT6Ec0vTlMtLTvVBjAn3q32lyyWMKJA4Fedy553dnt8PExxSUUZnffC62u0qNulbC1f6T/AJFCW/wcWplaFYUrPiKjd/xWuquWGvMpBrg1FKxtQyvHfmhXOyR0mE/TsMnuJ5+134Z67ZJLNs4lSMQUc1Wbf4W6u64XdTuFtt5wgbjx+lelNRd8RJKgEmOPWoN4oDapjI4NOj6nlqhU/Q+O90eaNe6Tf0m4hALif9QHeq2phalpKUFRmQDWydcXCGSrekKzEGszYSlTi3UrSRu3AR+lbnDzPJG5Hj/VeLHj5KgegfgKytn4eO7wlKvxSu8ngVqpBEg1i/wJuHFjUrUrX4aVJKU9u8/yFbQsbo5kVm8vWVlzgtPEhpZgDHzplU+3yp5Yngj6UOseYzNJSLVIYcJgmKHcMDke9EKBkzQzsbckfbNH9g0CuZyQfrQjy8Z+9ErILvahH84n5mnRQqTI56I3Dnioq6BKTOfpUq6EpBJqNuQNqoOPWmR8iZEDekJSSOeRVe1NUMhZ/QVYb5WO2arWoKhlW05CTmrMStLWzHtTWVarcEEn94ce00EcSeDFFXTS1X7y1GAVEx9aH/izgDIrVxaiYWWTcmcJUCFKBjjNcPAAjjAilFQVA4/vXCIMj7TimoXQKtRLuREmrDb7hbpSP0+VV4+ZyQojNWJtI8NMEiB3EUvN4DwJ9mXW4t0rBmZ7Y5qNeQppR3Ee1TS+4jEdqFuGQ62qRmORWTX7NVa0QiwThXPz96tHRrzSrtdk6BuV5ge01W3fKooXPMA0uwunbDU2bhBPlUJPaO/6UVNrqNxy6zTN30/Rnb5tCG9oEfm5ozTbdvS+uLNrAJSQZ75ojozU7UaUh5KkqChPzqE6u1lq31ZN4hW0zCSDkme1Ys4uU3Bnr8WWPt9kaFrttYWeqNtruCC4ndtSqaERqTDVkpKHlIRJKArmKpOj6hdawS+6VhwDajdk/Qc1erH4f6y9buXOpH9nWKW97l1c/mggkEJ4/wCRS/41OkWY8tzWyD/8Wpav02huVHf+WaMccU86HCoAKHFRZ0LTrnV3F2bavDZ8iVumVKMzJ9KfvHVMNkLIAAiRQ5Ix8I5d4X2Kz1PcIQ8oCCARWe/ETT2Wks3bLO1W2VRVjurtWsdVNWTSlLRuBVt9AakOstA/HaMAlG5SRwBNOhWCUWUpx/kqaMZ024U3eswQdygdvv8A4K2vTXNluxGSBxWP6baoa6uat3mdoSo4PrWjs310XgizQVFOPKJrU5dZEmjE9OS48pWaVolk6/cpdcV8knvV90vR3HyASCf9KcxWHt3HV4SlxCQwgmQVKzV06T6qvbJ6by7Up2MmcfrWXk46W2egxcxtUkaLcaBcm6QhAEA5nt86Re3emaFbO/jrhrangJPPtTo1y41DQl3NutIPB7SKy7X/ABNVvHGlIKjyRnGY/UwPrS4Y8TdIsSy5evZsnbnqrQXWCfETuJwBUIrVLa6fUlqcCfNUX+zbPpoId1zRlMzbLukl87P3aTBME8yQAOT2FEWV5oGpuD8EjwHCAQCIMRI+VHPjQirihGLmZZOpPRAdR6Xbas0tRACk8+hrH7y3/Z94rwwPD3Hg1u99ZG0eIK96VgyZmsg6o0yNceZQmCoEpT6z2q1wMnV9TP8AWcHeCmkar8BXW7ix1JaUjfvEkcd/9q2cpHf5Vlfwd0C56b6YWvUEQ9dK8TYDOwdgfetT3pKZg5E0rk5FPK2ilxcE8WJd0NrgKgCmlxBEU45kyOKZJj5fKgQ2hlcHHNDugFMx9aedJJxhNMLIJ5yKNAMBcSnf/fNBv8k8eh9aNdlJBmUz2qPuR5YBNPT/AEBJEe7+WR86jLhWCdxM1Ivkie31qKuIjt9abETIh7tZBMJ+Rqr6spIYXJIASas16CJwc9h3qp66oosXleiDn6VYgVsj0ZI46XH1EwZUfrTe0BYkdq+bClKUoFRk5MU4pBUg8n3rVVJGBO+zGdoTgK74mkgeUynNEeH5IEDOCBSVJUlJAkzkzRpgUwBI/wDMJgz5sD61ZWwYSSSRz71XGhN8mIPmqypB5gAg8GhzjMEqbR6N1v4baflvT3nGVwNu/IPsaznVtA1TSHCm+t1BPAWMpV8jXofVGgtIeT7j9Kg7htq4bWxctIdbWMoIBB+dXM3AxzVw0yvj504upbPNl42PFJ5jmO+aCPIMg4+dbD1B8M0XSnH9IuCgHIaczHsPasp6g0HXdDci6sHA0DhwZQfrWRk484OjTjnjJWmWnovqU2Tn7NuHNqf/AG1z+lWbUdIc1a8F145hKdyBzmsVYcW8mCo+JP8ACePrVy0bra60ttNveJLzKYAdSJI/vVXJxm32ianF5qgumTwbl8NeqdE6dVN7oyri/EoU7vHnB+fHbirRr/Xdxq9u5aXty2GIPg2zCoCSeCo/xEY9qx3S9b0rVwlxi5SpXJg5FTTN7o2kuG/uHPE2CYUZ+tU8kWnVbPR8XlYYx7QW/wBsu1lZqZ0/clJBX3IzVE66179n7bK3HiXC8JQOST6V9rXxctzZC2tGyp9UpQhvJOMVEaFot3fXv7c11E3Tg3NtnIaBz96rQ47hLvkJzcz3V1g7bJDonQFWjZvrxM3TvmJnirXe2wcaKSMEUqzQ02AVRH8qe1F8NaRcXCBPhoKhie1Vs0nklZb4sFijRhur6YbX4keREbpjHNX6zSNG0fxWGS6+oSO8GiurdJ0u1b0R9pSnLtxagtxXdO0EH6kmjdPtkvgJUQQMR2NXHkrGkyi8K99uK8kevTdW1C+t3LW8WpLlupt/8S4ttptZ/iAQRMDiZHeDxU1qVo069aM2CWQlpoIUprcQogCVFRPeDirFpHRzuoOo8UlLZ7DAp6601D167p+npSm3t1BLix/HHpQS5LceqRbx8NKXZvZN9LNtHp1VvsC1bOT3qNRods9rzdzbhbVwhW5JBIKVdiPf3qydMM21sy/ufSjYmUg/xU28rS13yrlF0lDycghUEH5VQeOSl2Rfh1acGQ+odKOvrSbiwbvFJBSlx6VkSc88VHs9JJZf8e6sm2yOCEgfSr5o3Vtu9cFGrseKCdoeQQhRHrxBNPa+9YPoH4J9ak7ZAVAIp0o5Ot9hWOMIy6uJk2sWLTLLgQkpjIms8tdLZ1P4k2CXGlKTlZSkSfLn6/7VofUV0lwONNkiAc8TUJ8PrJu56uVf3C1Ni3aMKB7kx/WuxP21bZHMjGSUUa07aWdraI/DtJSy43tCedpFDtQGQEmRXb+5b/BqYbBlCiolWK6hIDKU5EYoMc7dlPm1GEYs4eaYcVyB2p+SDgfcUO4STkzVhMy/DGVZz6DEUO4U/lgin1Rtmf1oZ3sD94xTAWgV2AOIqPe2lJPPzo5zuAqRUa/696bAVJ/RHvEQYP6VFXB25+uKlXyCSAY9IqJufzwkJ9adHQmSIW8Ud6sDOc1TepF/+k3EKMBsj9Kt98RBHfuZmqP1coDR7ggEmIwfpVmHlFXK6TaM+skJUFEz3M0+GgAVEyDggU9pNsCwpwiZAwBxR34YIBARGMzV2ct0jFScvJF+BKT+k0lxltFi4owVfLiplFoHUBXOYn04pjUWAzpjkYJByamM/pk9H9FUsRv1JoH/AFetXLwwEiRnkkf0qo6UhS9WazgEn9KvJZKmwIAxOBR8hpUgcD220eq9Z1VvTLhsrsDeSreWt20EfOoS66qUSU2HTlozPBd3rIH3FS9xbG8vFPLkqJPyr4aWgxKBz6VvPBe7MeWanpETb9SXalDx9Jso48qVJ/rRZe0TUWVJvbFxgkZ2HxE/IpP96JXpaAjypFAv2JSFbR9RU/x4tEfyJraM6+I/QPT+ndMPdR6K2wVIcQF+CrbG4xlB4z6CKx8p2+YpPtitm+JKFs9GFccvoSR9Dz27VjDypTKgI9BVDLjWOVIvY8ryRtjCXHWLlLtmtTTg/KpBifnRtxrWsXLRauLkBChCgBzQAO9zahBV6ACviT4ZKgBHI9Oare1Fu2ixHkzj9mr9G2ehN6em509CHHinzLXlYPerdb3Pn82ROTXn+wv7mwc/EWzy21A5SFcitJ6e6nYuGW/EdSFRB3HvWNzeJOLcltHp/TfU8ckoNUzTWHi7EYSPapAKaes3GlgFCklJHzEVSmep9LtUHx71pMjOeDQN18UNMsmdtm07du9iBCP1+lZa4uSbqKNyfOw443KRIfhBqHSSjcqUH9OKm0qnkoMf/wBalemLpJfQp0gpBnPeq98OdWPU2pa1aXK0NOrcS8hiYEKGY9e1TVtZOadrNxYOHappcxMyk5E/Sm5MThcJEcfkxy1kg9GsW+sNWWkK/eAFXA4x6VSLjVr83dwnT1pQHeVASQaJvbdT+mM3YCloSDuA9fSojpm2c6h6nNlcXLVhbJmUKUAo9h3k5il44di/PKoptk5YOrFvtVcOeIowqXAgfOTX1yjTErbNzqLQWnJFtLn3MR+tanoXTfw9srZSLi4tVkrBLjzm4iAJyO1G6xqnw2tNTecYZtrwIVuUthvcDAiBiP8AirDhUNicedSlSi2ZSm60+6QE2l42QMlCjBp1u6u0PKaS4kgAlOZIHeo670rSeoeohdWVi5Z2ickKMFX2/vU+7plnp+lNC2QlLrs8DKU1SbUdWXG9p1RRdaKlbnIzug0joZzSxfu/idZt7R3xU7WlrCSvP96L6kWi1sVJMeIZIxk1i/Wlp4V2wHEDcUzMZqcGFZpdLKXO5Psr3K8Hovq3q/pPp922tntSZur64fbSWmVb9iZjcojAHtU8hwLSFJyDXjVKwl5ta/MEkESef7V6N6N+JGl68ym1uNlleAQGlK8qvkf6HNXM3p/swTiYX/1f5M6lovhUff2oZe4KJwBNPkggEQQe4phZImqS0WWMEj60M4RuIkg+9PLETPP+9DuHBkgx60aYLVgzp2iRz71HXCoHHNGuklGDHoKj38GCfkKdBi5IAfxuIzURcqJCiRUo+Rkj0+1RVyoSTIJinoRNEJdk7SUmPfvVE6ueSjRXirjAIHzFXW+P5/PiD3rPesXEjTFJIMKIE9xmrOJXJFLL+Lop9vqF0ylQYcCEmMFM/rTitVvgYLiSfdIoRCR4UbecjvSSAcZPtHNaiimzDbabDTreopSEBSR8kim7rWL25sy06UAZBhIBoRUgGCY4yKZdTDRjJFT7cW/B0Zv6YrS1qZ1FK0EAgGCR7VZlardloAqTkchIPFVvS0lV0oyAIxPFTB7II4Hal567DuO9M9tIUjsnnvTyQABuE+9Bm/RuBQiB3xTLl2tavLOfSvSnnP8AAx5aNpEigHEBRjia+CiuJM0sJUcjAHOOa5BeTOPi5blPQQKRkXSJn5KrCHEktKB5jjivQHxic2fDttqf+pdI59kqrAtwkHJk1n8l/Mu4PwA7a4dtbk3DG3cAQCpIgT7V8VFxG8yZGSPWkrSQ6RmEzx3xS0yU+UkA4quOsbiN6QCScxTqCNgJkZ7YJpASPEJjkTExNO7UlGwBShNc1ZKdbQpJO2TJPcmleIoJ3JnPpSQkkFJMhIyZ96UlwIXGFAdhQ0F2cvLHbdbrbiXmnXGljzb0KKSPkRmp/pHXrjTOrgm4uluNXcAqdUSZHEk+1QafBeb3IVkYhXahn0hSSUKUlSFbkKB4P/NKzYIzi1RY4/Jnjmnej09p2qo/DeEXAW1DjntXbrRrXUXEveGA6nhQxNZZ0L1X+Ot/wt2Qm5ZwtJ7+hFanp+opdaStKwTxHpXl82J4pNI+hcLlxzQTsnNL05FkwApqTxmKsDlgXLVAKEFA7CP5UDoTCr+8SS62AnMKVFWLUVtMhTq7hlKGxwkwKW5ycHSNB5akl2Io24YawgAHjtULfag2jcsqkowJNJ1Pqplu3X5weyazTqDqpa3SxbeZasAJNUoY5zkFlzwhHyOXt2vWeq2rZsqWgLC1ZxA7VVfig0GNRt1BPKYmferr0fpymN11cz47hnjtVN+MSH91s+2TtEirvGfXkxRm8qPfi5JP7RnW+WwAQM9qeQ66g+UqSRkKBiKj7V8PNSRAEgg5okO94BAr1Lpo+e7T2aj0V8U77SnWrLXFqurJUAOqPmaH9RW3sXVveWbdzbuJcacTuStKpCge/vXkVLiS6M4HEdq2j4Z9a6cdBt9BvbhTd0kkNqc/KoEyBPrnisnmcRJd4I2OBy3fSbNNdWZIoZwnaRyZ4NJurxi1YLrygED6zUCNRvru6C2Vu26EmUBslKhnmfWsaeVQ8noMPHll8Ggad0WpSU3PUd43otu5t8EXBSlbszkBRHpU3pfwp0vqTp4ahZ3Wo2W9SktG8QiV7VFO7aknBiRmcis/udOe1S3KtTeevFuAhRfWXCZyck96L6WZ1XpBS16BqV1b2hEKsy4Vs/8A8CYHzEH3qI8uDdDcvpmWMbi7Ausvh/1F0q6XLq0LlqTCbhvzIP8Ab61nl2tSZ7EGIFetei+rOn+ounntCu7Jq1vGkKU9avrDiFonK0k8jIxyCfkT5l66s7ew6oukWqA00VkhuPyCeK0otOn9MzHF001TRRb5fmUJOBmc1nfWittohOCCvmtAvlEblk4NZv1m5PhpEnzzn5Vcw7kqM7kaiyrpIUyAfN3jmuKgwQCTEyIriZhKgAAexrilyk+bHAJ5rUr7MO/2cM/l5nsRMU1ckKRHb0FKMqIJVMZ5imncoGZpkUBIf0yUurhOcVMgpynCaidMUJWqARMVKoUPD2yDJiJ/nVfOrY7B4PZSmTJJ59K6m3VAKhJ9PWpEsSeI96b8IpVGK9HGSZhONIaQ0EphIE0qDtPsO1PbR4cCSaRBE4MVIFmTfGy4KNK0tjcQlTq1ET6AAH9TWJK/dbjMp9AeK1j416jbXOq2FjbKUty2Cw6AICVK2wJ7mPtWRvuKUIR+UD9azM0lKbaNHGmoJMJ0ZenN3bzmpMeMjwztbBiVSP8Aejf2SxqNm7daIqUtAqXaLX+8QAJUR/qAE5qBaV+8EnafQ96M064esNQU7bp2rEpGeZBBH2JpQ1OgZSXEuFM5B+eKXu8MhWeDg+tW7UOk2XrrUlWqmrEWSkI8F9UgrIyAocCRj9aqV8xc2rxYebUhwKygiJobDeOlYk7ikJ3bQcmulrakqG6R3NdSnzgq4nvTylnaEiMYzmalgJ/QwmQnyykYiDTrR2qCloCwkDynvSAgQEzSwrak/l+mTXHI+aPhXjd22tTTiFSS2cx3j6VqTF9rFpaoeYIuGSAQpPNZS68UMKUqACPvWo9Ev/jemmm1GVITsI+VZXqEPE6N70bM+3ttktZ9aXyEkDe2ridxFPu9S6tcjY5djYc5M06zprKnfO0DPrU/p+k2EoJtUIUO5FY0nFnp4wn+yoLb1K+WdhcI43KwAKkNH6fSLhLrnmXP51Crg7Ztb0obSNvfaKMsbBK3EhKISO0UueSo6LMOPf5HLe1S2yAlsADGO9UL4k6MdT0kNwQsGQfStbDDds1PKiOKqHUVsLpLi3PygT8qpQk1kUjQljjLG4PweYX7K4024cbfBBkQo9xTwUVJSqIPrRPUNyi61ZxKFKUjdj5e1RyQ4G9wOeCJ7etewwZW4ps+a8vAoZXFByAUnP1o6xTcPaowzaKPilY2xiCO/wDnpUaw1cOuobbQpS1GAgCSa2DoTpBuzdL9+kKusBXoj1FJ5fKjjxtvyP4HAlnzJLwWeyZu7tlly+V4ikJAgcT61bNPtm0oQlLYExOO1Ci2aYCUJipG2Iab3kiY79hXjck3J2fR8OFYoKESbQhvw5TjHJpl0FFuojg9xQjVytTSlSM5GaN/Pp4USOOaBBzVaZI9F3x0zp3Wb9brTd1ef+QsEuu7Q64Uq3Y5xKQCcSe5FZt11YdS3Nnb61qmhXVmwW0tG4W0pCXFZnJAz/arg11HrFvYWmm6Hp2k6abUk/tW4HjPJKidxTvCts/9iO/3z3qfqFxy8dau9Xv9UvVoUHnrkbWzJxskknHqB8q9BiglCNs8rmcpZZujPtR/KoZj9azXrGfFZEHvFaLqCipatxmPSs56uUoPoSOQDV/B+SSMbkU0yuA+Tjkc96bKfT7V2dyZIIxXwPqOe5FasWYTSTEZCuZ9M4imX5GyBTypUSO8Uw7lISFZo0c/AbpoAt1EwfN86kZG2CDHqODQOnpPg4MAmj8pBST7x61XzeR+FaP0Q0bT7JVkXb1pO3YVAKEqWZwB9qb1Dpgr1Z4Wjls0zIKUeJESOKhlJWIG+B2E00Qqck1sRjK7TM3vGuriS9z00kuBLF5aJSlIlSnOT3P1nFVy6bLF44xO4pURuHelvbvQmhyQScSafCMl5ZWyuMvCMH+Lum3Om36VG9S7a3jzlyhotgFswgGVd/8APrlBTGUntMxzWwfHAlzW9MbOUpYUYB483+1ZBKcBW7B4NZ+VJTaRbg24qxywu2bPU2rp+0RctoVJbcHlUMgg1dendKtepusXtWFqxpul2sPOtBRgdwPngkxjHvVAUnziDImcHJrRNK6N6wskNahYqZQ6pI/cl0HcmOFAjaR7SaAdBbqgvT1p6yutbs20MsNPv26txO2RvUmTnkpV9xUP1g8vqfqJdto1q0u209k+ZIjc2jJUSewkx/vUncXV1obbyr3RP2TcqQhQU1PhurQ6hSY5CSAFdzM0XptsLTWOpCwhPhXelLvWR6IWAqBHpMfSh+y1JWtGapSQoQgYME1wrVCRMDM+9dWFAAF0ATM85rjiXZAPhhJ/nRFNqnQgmXCQoyM8/wA6SF+YGfXnOKQXEoJTIEd4mkuSpO9GAcgg1BytCb0w2lsnKiCe9Xj4eXamLh1gyBukT3qhvwAIVKuwJqydI3aWdaQwT/1cD6Zqry4d8bRf9Ol1zJs3O0aQ/C5gnIBqesWHiQiAfeaq2jvKbUEOCUjuaulkWXIWkR65ry8/i6Pf4nasKRpwCJUQkj61I27RbTJQD/3HFcZ2FAgyafO5wDaIB7UiWy1HQM9KyVnP0rM/idrv7I0T9n2zhF3d4G3+FHc/0rVnGWbfT3Lq4X4bTSS4pSsQAJNeUusupHeo+q7rUAspZBKG09gkcfem8PB7mS34RW9Q5fsYXJeWVK7WV3OASoYOJ70+lBUwls8yPkKS00oEukgqUZ+X96IASFbux5IGQa9K1rR4OUnOds0P4TaI3f61dancMeJ+HhLZImFEc/OtN0tos6rdif8A3CDGcxQXwusDp3SfjutbUqHiLUcSf8ipLSnkv3N27bABtdwogjEya85zcvaTvwe59K4qx4It+WSbRWpwl3PpTxbXBEGAOSaSWgNRQ0kmdkkUzfO3PlZSqEyAQO9Z/tX4Nj3EmFStCAEkn5d6NVeJc0uEq2qSJzUW5cuWrBWsiYjPaoLVNcTpPTtze3JKJBCZxz7VMcDb0BPKkrM26h+IWtaV1veJsrnxLdKo8FzKQfbuMzT6+qtM6itWnwr8Pej8zajn5g9xWb3zn4u8ffKjK1lY3cyaCWNpAEgzgznFek/gRljS+0eHy+pyhyJSX4s0DUL1tp9LLytqiPKqDB+tZ51W5u1FERO3EVYNPfVqlkvTrxZLkEtOK5+VVnVLN43JaWslaDtG4/pTeLian1flFXlZFOHuQ8MhjKkxyOa7IEzieDSylTailYzPEU2ogpHeM8VpVsx2k0JUEiYNMODypGfengQVT6HvwKYeUN09qJEUmrJOwSkMIAPMnNF7gEz3POKEskgWqAqNvpPJooyRIkDNV8r+Q/HpH6tf/jLQh+Z25P8A9gKHd+HGgJJI/EZ/7x/ar8uBQjwkcDNO96X7LK4+P9GT9WdHaTpPTTt7a+N4iVADcqeTWYLjjbMGtq+IjgT0i4mYJcSAPvWKrhIzAnFaXFk5LZkeo44wkuqMX+NlspGqabchMoWypsq9CDP/APqsdfCS4J4nn1ravjbCrfSR/wBzv8kf71ir48NYH5hjHFIzKpsDG/ghgwq4SQffB/z2q8DrrX7fTrSxtCm2SxbIb3bEqUvH5vMDE81U9LtG7rqCytHpCXnktqPsVVbuutORb9SW5t2o/EW6CltCcT+TA+gpY3Hd/EsHS2rO9Y2N/o+tJS8fD3BQEROAQPUGDPvVKXfaz01rF7Y7tzgZcslJdSSA2rnaDxzI+daX0D0snp/RndZ1ci3dW2VOeJgMtjJn3xP6VlHVOssa31de3tm2W2XHIQI2yAIBI9SBPzP1qGWKbhb8kOp/cIUCrvA/rSD47wgrKU+kCnmbbckYwO9ENshQKjBg/aoEVYItoN28IbMnnH1oVrxgspSvESU4zUo8gzOdvINBtJHjmYEd6i7JG1rQuEqUEL9D/enmXVW76H2lne2R5h2jNMFlPiblJI583rTidqW0kqG0+UmDQyVoKE3GVm+9KX7WtaGxcpELiFbYwRyKv+l6e64UpCgR8qxP4O3yFa09pDrg2OpLiJP8Q5H2/lXo3SLfYQST/SvK87G8eRo996VlWbDf2H2mkbEgqI+2KdeRb2qiARPJkUZMIxPEVVusde0/pbp9/V75QISIbbnLivQVQuTdJGsopbk9FG+M/WLOmdJq0W3dR+Lv4BTPmQ2DkxPeI+9eajcqQI2BazMCc/8AFHdQa/qPUev3WpXTpPiqncrgCcAewxUaE+EgqSvzd1rr1HB4ftY/l5Z4j1f1H38vWH4odS4spBWSJwQnt/k1begukb3qrqJFtatHw2oW46qYAn+f+9U0OEiQmE/6iMk+1Xroj4iah0dpl5a2dk0745kuFUKHtP1q3lg+lQRn8KWP3k8r0bV1pqFn0v0UdKslJU+pGxAH5lK9h3PeheiQ010taocUVOBIUsrPmJxz9axxnq3Ub7qo6hqb8qeBbMDDYPpPFXCz15vTgwyxftEOqCUoJkz/AGrz+fiNRo9th9TxZJrq9I11tbS79b0SY2pAFJbsvxWpuXK1w0wNqUniSMmo+2urez0j8Q9cIUUgrUueIp1Gs2j/AEy2/bXSVIcG4qScVR9prSND3U92Sdvp1vdOrdf2qbZTME8q7Vi/xi1y38S30i3UCEq8RwDse0/rRV/8Z/2ZcXen21gLhrdCXfEgYHf2rJdY1O41i8d1C6J8V1RURyEitHh8Oampz8GF6n6rjhjljg7kxhSlOL2ggRz7RSF/lUoJgCMivm0kKncTEdua+Kk7FkKnHMdq30rPG9/2cbcU0+h1B8ycz3mjNfaSpy31FkqIfT5gB3qOCwETMe4o564Q9oqGVKG5C5AHpH96TKLUlJFvDkj0lCRA3dulbZXgEcio8o3K/MOe3FStw4EtrKj2iocqSkfxT68VY/soXR1QwQI95oZaSRMwaeJBzGPlzTC48XB59KNHMlWCoWqNxCT86IH5JUIzJodr8qcAwOQKeUBsBjkc1Wn5H43aP1v6Z1q+1rTF3t6002lSobCJyByTPvUo6sqPoKZ0+2RYaWzatpADaAn504ZJk4A9aKXnRex312Zv8ULsN6fa2AI3LUXDnsMCsmdyc5NW/rnVDqfUb7qFFTTf7tv5CqaZCT2Ecj1rY4kesDB5+TvkpGd/FbRLnVell31q0FGw/fOmPyIJCSfuU1g1wwTp5uvEThWwokbuJ4r2Xomjsa5a65pr6SWrmzFuok8bzEz9Jrx5rWnvadrN7p1wAh23eW2oD1SSD/Kq+d3NhYo/87AdOdLGvWjwKf3bqFz6EKBrUtG163v/AIwLtXW2ltln8M0sZ8yCVT9fNx7elZIlCvFmRHII7UZZXz1hrVrqLS1F5l1LiVFWSQZzSg4S6lv+InWuoareq0JFs5Y2jJIdYP5nTIA3H0xgVRvBHhySomJgVZOutQtNU+IF7qNi4HGXNoDiSSFwkDd7THFV9ySCpRkHt70LY7JO/HgKbADCFSZjgUsJMQPKCCY70PZqdKSkgQYzRMZkCY7xQi0DOASSoERwB8qZbQJUVCPWO9OPrJcIiB85pJSW2TJSZ+1SiXsYUNqitA5M8c/5ilBQUlLJQEhQg+5xToTuTyMTFNDYF+YREHNc9HV2HtOu7zSNUbvrRe24YWFAwfMPevWXw/6rZ6k6VY1BogOfkdR3Qr0ryg62lSw8gykjKZ71dPhT1arprq9Fm+6r8HeHw3AVYSqYSf6fX2rN9R46zY7XlG16Ny3x83WT+LPVyrlaUZMk8V5V+K3WbnVPVjjTLh/A2ii20kHB9T9f5VsXxO6wR050aWmnkG7vUltoHJCT+ZUfL+deXHFrcUpfcme5JJFZ3pPFcpe5JeDe9d5yx4vag9sbWRtEkzOABgV1u3W6sLfx3APr70620ZkmTxzRCAgKVOfUmvQt6PEJNsR4Q3gQJmYHanUNbVQUiZmY5roMEARPpxFKPOTzQOT8IPrXkbcMKhQkz600jehIUlRxkf59adKJ82f5iuiCmUhQAPpUpL7JcpXaYV+19ZdtFWi794sHlClGDQ7b1+lk24u3QwrltKjB+lKATtxmRJFIBAHED5c0rpFbSLCz5ZLcmNutpDStqQaYbWnw9vABn50UTxAgkcA80EgBO5JOew7RRp2Vp2O4Ikq3GfKfWlCFNqCiOOB2ppCklJ2kE5n3rqVJLpTMKjj1omqF22DyAfoRuxiuKWEwpJJ9a6TiNsmYj1ptbZUlRGSMjETUqkFQPcDewpS4AmBEmo8oA7EnsaPuFJTCFA8yZ9aEWAsAhYAiM/2qJN2TFUtjCk4gAD5c8UMRCwIg+go1Q2/mB44NCnzOAyYkc0UWRJEo0oBuBEcUvB7bo7n0riAIlOcUsJSEkGFRk/Oq86sZi8WfsGBIgk1C9WaqnR+mHnEKh50eG36yeT9BU0M9x8qyr4jat+K15Ni24fDtUwqOCo803FDsy7nn7cGyhXiztJMkknmohwYPMntUpdEe9RzvlclQnvWzj14PN5G5Oyc6MUpK9TdBhKQ1un/5H+1eVvi3d6ZqHxd1y60nDCrkyqQAVx5yCOxVuNelWX7iy+HvVWoWyy28i3ltYMbSlKjP8q8dXi1uLUpfmUpUk+tZmedZaNTDBfx2yPR+cmSAcc188ShoqmCM0pMAkk84rrxHhrBMgoPNEVhpkkWjQ2kEgHnn6/WiGjLakEDdE8UOnb+CbBwraJ706mPBLokRgiBQ6Yym2PMgofKUx65FFFRSTiSr3mgQqHwrcIUMGjwoKQmFA0typjFG0MqSVE9x6cUy8FZGdogfai0tgk9gR9KHWiFETInlUUVkMQ0EBJ3HaI45rrrCVMJWDJByI5pSAJJjNPiFoUDkKzPoa67OSp6BmSIjt6E8Up1BS4l9AgjIIiuutqa/eNgRHrxXA7vbVvmSIjtQPaGJtMkuoepNQ6n1Bi4vljc0ylpMcQkR+uTUM7uD4VG0A5Mc0ZZ2N3cWFzet2q1MWxAddB8qCqQB9YNM7QYGTPIoYJJdUg8s5ZHc2Kb24O0z6inCABuzNJ3bUpPb0pfbB/Wietio7dHCR6wf8FfKWJUSD7GOKSUqCpwRyTPFdJCU7SYMVFBU/sUpRBSQBHMdorilEN4WZFJCjBEFU+3NcJMgcn3rmT4FLPkkwTNI3yQVHgTHrSHlFCCOZgyTTCSCCrAAP3qIxs6U2lobu7tYkIJngkYzTbLv5XFEHuQc801cYndgE+lI8YEBsHynOKaoITKbDUEblcgT2PJphpROoTIgCDTjUJRuJUSR3ptHmUtwwScR3/zmp/0gUopxBzX3mUkFcA+wpspl3zfIzxSwSkAnM8kcCharwSn+wk9PMugO/iXgpQ3Hg9qSrppCRIuV/IpmaNs79At0JXkgdh7VIs3tosGQqOCIrPnlmmaEMcKtleX02sJgXZIV6ooZ3pl1hsPJuUrAOAUxVu/F2ogQsZEEpwacurnTlWBSUkKJ8p24NTHNN/ZPtY2yklGxOwo2wDJPFcGUiRIj55qXWlkqKDx3xzQrlmgq/cqieEnM1Hub2C4ddI/XC8fTYaXcXjhG1psrIPeBNYDf3K7q+euHTKlrKjPvWufES+/CdJi1QoJXcrCf/qMn+n3rGHFJByRWtxY/ZV5+TxEFujuHBx6VHumBChRlwo/wn3oN5Q2mYP8AOr8UzKckF3Cd3wX6hCSQt0OIgc/9Mf3rx1eyN+eDxya9d314mz+EOsrmClazgxPkEV5Mubrw2SyWmVtkrjegFRlMc8mMEDsc1j5t59m1gX/mItKYaEgzPNIeCQwokkGDkinJJbjg/Km7mPw6zmQDnuasFB+T4iEI2yYAHPNJ3EJP2MU6YDon0gkCm1oLDnIKY9+KCg09nyVAqgKz29qOZckhtX0AqPx4ifNAP6US2ra4pRAjjFRJBJtkiSJB5j2E1x5ALfkT+bNMNuhRV/rOfLTzhJTBmewHalsNDCEmFGZjHFLQFAyRMff5V1MJRiZPaK+bhKsGQcV1kp/Z1cKQTsJBH1oVIU4NilQP96NWYExnIM0NA8ZsmJ9alf0ElfkWltSLfYSoJSSqI5J/4ptCRJXM5xRS1qU35QCk9xx/nNDpGNwjmcioTZEo+NhemaTf61rVro+nMePd3TiWWWwY3qUYAHz4peuaJqfTmt3OjaqyWLy0XsdbVBII7YkU5o141p/UllfXElph9C1gCZQFAkR3xRvWWq2Gt9aalqemoKLS4eUtpPghmAf+wEgZ7A1LbaDxRjbsgIK0yISr3GK4lJCRJHEZr5tJQylIAj5xNK3mM9hz3FR9ENI5sBJBORxHeuBGCEKMDgf804CoIBVknsDNIJWoCCQM/WpWwWkB3B2oIEkzzNBhcPmPzZ9ooh9SpO8Ak+9DFUblER6GOalKmDIRcOFRlXChAg1HBEugEnmBRjsuqO3HfIofLaklQ3bvfimJCpMkUKCLeCBMdjXVqIZSCPNyfekMfvFIQJIPmVjNPLQpbgCcJGRihl5JjtDAzkwDHB708k7kEQBABFLLCfD3FckU2kEkncc/eoRNfYoKEbipKfYxFdQ+lICgseuDkULcglsEk+8UIrgCfv3qpPHbLkMtImjfflSVpUJ7GjbjVkK08MpabmRmaqqwdsGDHNJbVD4g/ah6fob3RN/iFTuiD75xSkvpMqJzP0oFJJ5ICf5/3r6DGJ547UHUK0fpn8UL3xNcYs0nDLcke6s/2rO3VJUMgVY+tL03fWN84VSEulAPsMD+VVhxQ7foe1bmBVHRj8uXbIwV49t0TnOaDeWIJEUS9giSKDcVInnP3q3EpyIvqd7/APU3UDJJB/dkRzBma8v6lAf2xgA5mvS+utO3miajZoSFeJbOED1KUlX9K8zXxV+PWgwAOJrKzQ/72amLL/5uoM0Ds8uQe5703dqBtF47RzTjMSfMD2203dYaLYSMqTj60ZX/ANFYnaSTGM046kFGwnjtHNNOAJWQrn58U4TuaCu8f4KiwqBSCl1IIJT2M5+VPSENgY+RP+elNrUVbEkAiYn0p5CQoKPJyPl2qP8ASd/RxJhyJz6UYhcqBHMSaDWFIWrvHalNOlLZzMHEj9airCvew9SxzAgmYFKbKSkDdPzoVC5RCpVEGRilbwptKRII5JpfUNMfUZBAnd7Uy2klSFKwN1OBQ9BH+ZpI2+IFAZnJnFT48EK2P7dzRCPuaGbJBhPy+dE5CCSnMRNDIG5BkA444zXEs6qFAmYmOKW2rdKYEkA7TTclIjBCTzNdSr+JPIHpUSOiOQndCpjnAiaSkIKswMR8q6kgo/054Ir4EeLO771CYbX2JMbyOyRic96ZecShlRkkzwaW6vagmZ7TxQhUlaCDGfrXNkLYwtUrJHBORSJgQeOBNcmVEjzdsUoGCPU9iJ/zvRoCQkoBBIE0HeIhKVCdvt3o7lXMTzQ95t8JJTke+KJPYD0O2YgGSd3b2ozARP6d/wDig7NxJGwkmO9EpWkqnj5nmiYKOvAIbwDJ5HBoVvdG1JOPU96ffVKByMxJxFNAKKIVETNA2NiNvyLcgkxjFBFXl2wAeOKkCAZCifSKj1DKp5GPlSZ6Y/pq0IWQQE7gJxNfNpJdAMevrNfLSNsiSTkEgUpo7lxkA4mKHRNsfiFbeZP0NKBVsMAgEyDivhEcHaDzNcMlPIJODSWNuz37qj/j6rcub929xRn61FOrCZlWacW5t+1BuLkEg84rfUeqowpSc3bG3T5h29RQjipTMxFOurj1PtQzjkE7DRoX/pHXqnAZaWUq7ER/nevMupDbrFynYMLUCOO9el7kncQTkRXm7W0NNa/qLThKNq1hO0TJBjPpVXOt2WcUrTRG26iZxNIuTDrOBlcj9f7Vy3JKCN0wY9a5cGHGoykKxPbFJGI+UorTOT7+tJJ8u04nifWumQyFAkwYIGaQQlaSRM847UIadnxncle2E7sjnNPNqShzaTMenah3FFSU+GqDOUxxTqAZJVgE5Fc2SmKWtWCQSeT3mlJ2Hyjkn+VcAicj/ek/+6FTI55qEdY+lKvEKAQJpaYVEpgHBFNSVxA7896eWQVAxGZIFQ9hL9i9xSmANojmkhJC07cyZNPFP7ufUd6DCtjyY/NORETUI6S0TIsL57Sbi+YYW5bW5Sl1wEQgqkgRM9j27Go7cop8qZn9KIDzhti14ii1O7YTie9MNGYBnGM+ldT+w+yaVCFpPhkZJ9qW2P4CRETj+tLSTmATOflXNiSQrG49/Xmo0Qr8iWiIKZHc/wCfallSiADHPYUhQJMIz7UqClMkkRnFd1I7NgtzuCo5EY/tQsHZCcEf5ijLrytJCk84oRXmEn9fWu0RTY2SUyBkc55pPcbT3GTTgRlRVCpGCDSSYQABmJyIqLC+jikwrk7qZuBLYWMme9EKO78owPtTNwVfhyJxGR60SYuVMaZEEhsGe/6UWHghBCkkR3iaEtVpUTOI49qU+pSlHw845FGyEEeIHWSpPr2xFNpwSSJIxjEZpLA2WqjOfWK+SojIBmQDUNEqSFkp35BIJ49KDX5VwBgmcUZgpxkd5PNDPYuSRBnvSciLOObuhhagEmcexpTSFSRB9YNfOSTvCYT2jtS2BGBkR8qQ2P8APkdwDuInvHYV9yCDj/SRnFd24BJJB47TXCAhJiPWlk9T3E4tKzHJ9qGW5nmPbikOFUkhRHrFCuKUcqMzXpkqPO2Kdd3LBxQzi1bt0n+9NqKvEICqEcUsACcelQ2QlbE3DgCjKsV5p6gfDnUV6olIUXlQBmDuM16NdUorkmvNmtLB6hvOSS6oZHvVTKWca8g1vEHnk4IrlzBU2dpwsSDx8qVbE+AD6KMUm7SFWxMkEZBH3pI1CyC0ncQRP5qQsbDuQAQeY9KeT+8ahQHMUOZShQmUycVAXgaKYeCwsjMY54p4Rs74P1plZKVpSTyYFPNyQoJPbgjFQyULCVGVAwO2eKSoK3mcq9DxToVztFIIlwoPEZNCgq0KQqFhWSD7+1FpQHEJJSfahGhuWATijBuKTwCk/euZEUddUEsQcq/lQiEStK1c+sUolZV4e1J9JrqRhIPIEiPeoDb1Qc2Bt7xmB3+VNJA8SAYz3p1AIaKic00ELKzBArr/AGQlR3bA3cz7V8UkJICgSOO018RDqk9xzTiEymNyvlPNRaCG1AyIHekw4V5BIP6UQUgEJH/yrkp8MKzzBqOxLj9oFcQFJG8GhVpDaSVGRJEDij9oKdpAhPqJoC5dLjhSkbQmRFTQKVsZUsqSSAM+lN4WqdqpPvXQEhWRHbBr5KwlRAGE84qaBbOKBPMDPftTS5UjzDA4mnEjcpIJ5NIWgpX2MjM1KQLBmXFNoVjNdmcmZ7e1MLVsfKB6mn2kkqA3HzY+VGCmFJBRa4x3me0U2lUndjB7Hn5U+6B4SUgmP7UMlIWg+gzUNkpDkEHalJED2xTTpO8Qcx2p5IJcEcGeTS025WgkkQnv34qvllSss4m26AifKCfKDyAKWyiUKgiDj1otVskbc9pE/Kn2bZvw5Az+nFUpZFRc9p0B+EqRgEnsa6WSUEJRgCKkQ0lPmie+aWlsFO1ECROaU8oxY6VH/9k=',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Gunjan HR',
    role: 'HR',
    email: 'hr@kmrl.in',
    department: 'Human Resources',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Tanisha Employee',
    role: 'Employee',
    email: 'employee@kmrl.in',
    department: 'Metro Operations & Signalling',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-101',
    title: 'KMRL Comprehensive Leave Policy Manual 2026',
    filename: 'KMRL_Leave_Policy_2026.pdf',
    category: 'Leave Policies',
    uploadedBy: 'Gunjan',
    uploadedByRole: 'HR',
    uploadDate: '2026-07-15 09:30',
    fileSize: '1.4 MB',
    fileType: 'pdf',
    status: 'Approved',
    approvedBy: 'Sujal',
    approvalDate: '2026-07-15 10:15',
    isScanned: false,
    version: 1,
    extractedText: `
KOCHI METRO RAIL LIMITED (KMRL)
HUMAN RESOURCES DEPARTMENT - LEAVE RULES & REGULATION MANUAL 2026

Section 1: Casual Leave (CL)
1.1 All regular employees of KMRL are entitled to 12 days of Casual Leave (CL) per calendar year (January 1 to December 31).
1.2 Casual leave cannot be combined with earned leave or sick leave without prior approval from the HR General Manager.
1.3 Maximum continuous Casual Leave that can be availed at one time is 4 calendar days.

Section 2: Sick / Medical Leave (SL)
2.1 Employees receive 10 days of Sick Leave with full pay per year upon completion of probation.
2.2 For sick leave exceeding 2 consecutive days, a certified medical practitioner's certificate from a recognized hospital or KMRL empaneled clinic must be submitted to the HR Portal within 48 hours.

Section 3: Maternity & Paternity Leave
3.1 Female employees are eligible for 180 consecutive calendar days of paid Maternity Leave for up to two surviving children.
3.2 Male employees are entitled to 15 calendar days of paid Paternity Leave, which can be availed within 6 months of childbirth.

Section 4: Earned Leave (EL) & Encashment
4.1 Employees earn 30 days of Earned Leave (EL) per year credited semi-annually (15 days on Jan 1 and July 1).
4.2 Accumulation of EL is permitted up to a maximum limit of 300 days.
4.3 Leave encashment up to 15 days per annum is permitted for employees who have accumulated more than 60 days of EL.

Section 5: Emergency Leave & Special Approvals
5.1 Special bereavement leave of 5 days is granted for immediate family members.
5.2 Unapproved absence exceeding 3 days will result in disciplinary review as per KMRL Standing Orders.
    `,
  },
  {
    id: 'doc-102',
    title: 'Biometric Attendance & Shift Schedule Regulations',
    filename: 'Attendance_Shift_Policy_v2.docx',
    category: 'Attendance & Shifts',
    uploadedBy: 'Gunjan',
    uploadedByRole: 'HR',
    uploadDate: '2026-07-20 14:10',
    fileSize: '850 KB',
    fileType: 'docx',
    status: 'Approved',
    approvedBy: 'Sujal',
    approvalDate: '2026-07-20 15:00',
    isScanned: false,
    version: 2,
    extractedText: `
KOCHI METRO RAIL LIMITED (KMRL)
OPERATIONS & HR CIRCULAR: BIOMETRIC ATTENDANCE & SHIFT GUIDELINES

1. Punching Protocol:
- All station controllers, train operators, technical staff, and administrative personnel must mark attendance via Facial Recognition / Biometric kiosks at Metro Depot (Muttom) and station hubs.
- Grace period allowed for morning shifts is 10 minutes (up to 09:10 AM). More than 3 late marks in a month will result in a deduction of 0.5 Casual Leave.

2. Shift Rotations:
- Shift A (Morning): 06:00 AM - 02:00 PM
- Shift B (Evening): 02:00 PM - 10:00 PM
- Shift C (Night/Maintenance): 10:00 PM - 06:00 AM
- Night shift allowance of ₹350 per shift is applicable for Shift C.

3. Remote & Field Duties:
- Station maintenance team members on field inspections must log geotagged check-in via the KMRL Staff Mobile App.
- Duty roster swaps must be submitted 24 hours in advance to the Shift In-charge.
    `,
  },
  {
    id: 'doc-103',
    title: 'Pink Line Extension Tender & Procurement Circular',
    filename: 'Procurement_PinkLine_Phase2.pdf',
    category: 'Procurement & Tenders',
    uploadedBy: 'Sujal',
    uploadedByRole: 'Admin',
    uploadDate: '2026-08-01 11:20',
    fileSize: '3.2 MB',
    fileType: 'pdf',
    status: 'Approved',
    approvedBy: 'Sujal',
    approvalDate: '2026-08-01 11:20',
    isScanned: false,
    version: 1,
    extractedText: `
KOCHI METRO RAIL LIMITED - TENDER NOTIFICATION
PROCUREMENT DIVISION - PINK LINE PHASE-2 (JLND STADIUM TO INFO PARK)

1. Scope of Work:
Supply, installation, testing, and commissioning of 750V DC Third Rail Traction Power Supply System for Kakkanad extension (11.2 km, 11 elevated stations).

2. Financial Eligibility & Vendor Qualification:
- Average Annual Financial Turnover during the last 3 financial years must be at least ₹120 Crores.
- Vendors must possess ISO 9001:2015 Quality Certification and experience in Metro Traction projects across India.

3. Key Deadlines:
- Pre-bid Meeting: August 18, 2026 at KMRL Revenue Tower, Ernakulam.
- Last Date for Online Submission: September 10, 2026 by 15:00 hrs.
- Earnest Money Deposit (EMD): ₹2.5 Crores via Bank Guarantee.

4. Contact & Portal:
E-tendering portal: https://etenders.kerala.gov.in
Procurement Nodal Officer: Mr. V. S. Pillai, GM (Contracts).
    `,
  },
  {
    id: 'doc-104',
    title: 'Scanned Leave Application - Tanisha (Medical)',
    filename: 'Scanned_Leave_App_Tanisha_0804.png',
    category: 'Leave Policies',
    uploadedBy: 'Tanisha',
    uploadedByRole: 'Employee',
    uploadDate: '2026-08-04 09:15',
    fileSize: '1.8 MB',
    fileType: 'image',
    status: 'Pending Approval',
    isScanned: true,
    version: 1,
    extractedText: `
[OCR EXTRACTED TEXT FROM SCANNED DOCUMENT - CONFIDENCE 98.2%]

APPLICATION FOR MEDICAL LEAVE - KMRL
Date: 04 August 2026

To,
The HR Officer, KMRL Muttom Depot, Kochi.

Subject: Request for 3 days Medical Leave regarding viral fever.

Respected Sir/Madam,

I, Tanisha (Employee ID: KMRL-7842, Train Operator - Shift A), request medical leave for 3 days from 05/08/2026 to 07/08/2026 due to severe viral fever and doctor prescribed bed rest.

Attached herewith is the Medical Certificate from Medical Trust Hospital, Ernakulam (Reg No: MTH-2026-881).

Thanking You,
Yours faithfully,
Tanisha
Sign: Tanisha
Emp ID: KMRL-7842
    `,
  },
  {
    id: 'doc-105',
    title: 'KMRL Station Safety & Emergency Response Circular',
    filename: 'KMRL_Safety_Protocol_2026.pdf',
    category: 'Metro Operations',
    uploadedBy: 'Sujal',
    uploadedByRole: 'Admin',
    uploadDate: '2026-07-10 16:45',
    fileSize: '2.1 MB',
    fileType: 'pdf',
    status: 'Approved',
    approvedBy: 'Sujal',
    approvalDate: '2026-07-10 16:45',
    isScanned: false,
    version: 1,
    extractedText: `
KOCHI METRO RAIL LIMITED
SAFETY & OPERATIONS DIRECTORATE - EMERGENCY RESPONSE MANUAL

1. Platform Emergency Stop Plunger (PESP):
- PESP switches are located on both ends of all 25 operational platforms from Aluva to SN Junction.
- Activating PESP immediately trips traction power and applies emergency brakes to trains within 500 meters of the station.

2. Fire Safety Protocols:
- Automatic Fire Suppression Systems (FM200 gas) are installed in signaling & OCC (Operation Control Centre) server rooms.
- Smoke detectors trigger evacuation sirens when smoke density exceeds 0.05% per meter. Station Masters must execute Level-1 Evacuation within 3 minutes.

3. Passenger Grievance & Escalator Safety:
- All station elevators & escalators are equipped with dual optical sensors and emergency stop switches tested daily before revenue hours (06:00 AM).
    `,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log-1',
    timestamp: '2026-08-06 09:20',
    userId: 'u-1',
    userName: 'Sujal',
    userRole: 'Admin',
    action: 'Document Upload & Vector Indexing',
    documentTitle: 'Procurement_PinkLine_Phase2.pdf',
    details: 'Uploaded procurement tender doc, processed 8 chunks into vector DB.',
    ipAddress: '192.168.10.45',
  },
  {
    id: 'log-2',
    timestamp: '2026-08-05 14:12',
    userId: 'u-2',
    userName: 'Gunjan',
    userRole: 'HR',
    action: 'Document Policy Update',
    documentTitle: 'KMRL_Leave_Policy_2026.pdf',
    details: 'Updated Section 3 maternity leave limits and re-indexed vector database.',
    ipAddress: '192.168.10.12',
  },
  {
    id: 'log-3',
    timestamp: '2026-08-04 09:15',
    userId: 'u-3',
    userName: 'Tanisha',
    userRole: 'Employee',
    action: 'OCR Processing & Submission',
    documentTitle: 'Scanned_Leave_App_Tanisha_0804.png',
    details: 'Uploaded scanned image. Gemini Vision OCR extracted 184 words with 98.2% accuracy.',
    ipAddress: '192.168.12.88',
  },
  {
    id: 'log-4',
    timestamp: '2026-08-03 11:05',
    userId: 'u-3',
    userName: 'Tanisha',
    userRole: 'Employee',
    action: 'RAG Search Query',
    details: 'Queried AI Chatbot: "How many casual leaves do employees get?" -> Routed via HR Agent.',
    ipAddress: '192.168.12.88',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Pending Leave Approval Request',
    message: 'Tanisha (Employee) uploaded a scanned medical leave application requiring HR review.',
    timestamp: '2026-08-04 09:16',
    type: 'warning',
    read: false,
    targetRole: 'HR',
  },
  {
    id: 'notif-2',
    title: 'New Procurement Circular Published',
    message: 'Pink Line Extension Tender circular has been indexed into the RAG vector database.',
    timestamp: '2026-08-01 11:21',
    type: 'info',
    read: true,
    targetRole: 'All',
  },
  {
    id: 'notif-3',
    title: 'Leave Policy 2026 Approved',
    message: 'KMRL Comprehensive Leave Policy Manual 2026 is now live for all departments.',
    timestamp: '2026-07-15 10:16',
    type: 'success',
    read: true,
    targetRole: 'All',
  },
];

window.addEventListener('load', () => {
    $("body").addClass("login breakpoint-1024");
});

const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
    
    e.preventDefault();

    const email = form.email.value;
    const password = form.password.value;

    const response = await fetch('https://cluster-01.apigratis.com/api/v1/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    let data = await response.json();

    if (data.error == true ) {

        $('.alert-danger').css('display', 'block');
        $('.alert').text(data.message);

    } else {
        
        localStorage.setItem('user', JSON.stringify(data));

        const user = data?.user;
        const device = user?.devices[0]; //your loop where you are getting the data
        const search = user?.devices[0]?.search;

        localStorage.setItem('device', JSON.stringify(device));

        window.location.href = `/chat?welcome=true&session=${search}`
    }
});
window.addEventListener('load', () => {
    //body add class login breakpoint-1024
    $("body").addClass("login breakpoint-1024");
});

const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.email.value;
    const password = form.password.value;

    const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    console.log(data);

    if (data.error == true ) {

        $('.alert-danger').css('display', 'block');
        $('.alert').text(data.message);

    } else {

        // const cellphone = data?.user?.cellphone;
        let ddi = `55`;
        let ddd = data?.user?.cellphone?.substring(0, 2);
        let cellphone = data?.user?.cellphone?.substring(2, 11);

        let mobile = `${ddi}${ddd}${cellphone}`;

        window.location.href = `/chat?welcome=true&session=${mobile}`

    }
});
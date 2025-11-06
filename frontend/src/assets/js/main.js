import { setCredentials } from "#features/auth-slice";
import { store } from "redux-tps/store";
import { axiosInstance } from "services/axios-config";

(function () {
	const { pathname } = window.location;
	//===== Prealoder
	window.onload = function () {
		if (!pathname.includes('admin') && sessionStorage.getItem('user')) {
			const user = JSON.parse(sessionStorage.getItem('user'));
			if (user.token) {
				axiosInstance.get('/auth/me', {
					headers: {
						Authorization: `Bearer ${user.token}`
					}
				})
					.then((data) => {
						const user = data?.dt;
						if (user) {
							store.dispatch(setCredentials(user))
						}
					})
					.catch((err) => {
						console.error('Token invalid or expired', err);
						sessionStorage.removeItem('user');
					});
			}
		}
		window.setTimeout(fadeout, 500);
	}

	function fadeout() {
		document.querySelector('.preloader').style.opacity = '0';
		document.querySelector('.preloader').style.display = 'none';
	}


	/*=====================================
	Sticky
	======================================= */
	window.onscroll = function () {
		// var header_navbar = document.querySelector(".navbar-area");
		// var sticky = header_navbar.offsetTop;

		// show or hide the back-top-top button
		var backToTo = document.querySelector(".scroll-top");
		if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
			backToTo.style.display = "flex";
		} else {
			backToTo.style.display = "none";
		}
	};

	//===== mobile-menu-btn ==> Đã đổi thành dùng trong react component rồi
	// let navbarToggler = document.querySelector(".mobile-menu-btn");
	// navbarToggler?.addEventListener('click', function () {
	//     navbarToggler.classList.toggle("active");
	// });
})();
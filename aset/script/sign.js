document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    const signinBtn = document.querySelector('.signin-btn');
    const signupBtn = document.querySelector('.signup-btn');

    const signupSubmitBtn = document.querySelector('.signupSubmitBtn');
    const checkEmailBtn = document.getElementById('checkEmailBtn');
    const metaCSRFToken = document.querySelector('meta[name="page-version"]');
    
    const emailInput = document.getElementById('emailInput');
    const alertBox = document.getElementById('custom-alert');
    const alertMsg = alertBox.querySelector('.alert-message');

    let isEmailChecked = false;

    /**
     * [공통 설정]  CSRF 토큰 결합
     */
    const getCsrfToken = () => {
        const p1 = metaCSRFToken?.content || '';
        const p2 = container.dataset.isDisplay || '';
        return p1 + p2;
    };

    /**
     * [유틸리티 함수]
     */
    const showAlert = (message) => {
        alertMsg.textContent = message;
        alertBox.classList.add('show');
        setTimeout(() => { alertBox.classList.remove('show'); }, 3000);
    };

    // 이메일, 비밀번호 형식 검증 공통 함수
    const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    const checkPasswordSecurity = (password) => {
        // 비밀번호 보안 규칙 검증 (6자 이상 & 특수문자 포함)
        return password.length >= 6 && password.length <= 20 && /[!@#$%^&*(),.?":{}|<>]/g.test(password);
    };

    /**
     * [화면 전환 이벤트]
     */
    signupBtn.addEventListener('click', () => container.classList.add('active'));
    signinBtn.addEventListener('click', () => container.classList.remove('active'));

    /**
     * [로그인 처리]
     */
    document.getElementById('signinForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const emailInput = this.querySelector('input[name="email"]');
        const passwordInput = this.querySelector('input[name="password"]');

        if (!isValidEmail(emailInput.value)) {
            emailInput.focus();
            emailInput.select();
            return showAlert('유효한 이메일 주소를 입력해주세요.');
        }

        if(!checkPasswordSecurity(passwordInput.value)) {
            passwordInput.focus();
            passwordInput.select();
            return showAlert('비밀번호는 6자 이상, 특수문자를 포함해야 합니다.');
        }

        try {
            const response = await fetch('/signin', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-csrf-token': getCsrfToken()
                },
                body: JSON.stringify({
                    email: emailInput.value,
                    password: passwordInput.value
                })
            });

            const result = await response.json();
            if (!response.ok) {
                // 서버 유효성 검사(checkSignin)에서 던진 에러 메시지 출력
                const errorMsg = Array.isArray(result.errors)
                    ? result.errors[0].msg
                    : (result.errors?.msg || '로그인에 실패했습니다.');
                showAlert(errorMsg);
            } else {
                // 성공 시 메인 페이지로 이동
                window.location.href = '/';
            }
        } catch (err) {
            showAlert('서버와 통신 중 오류가 발생했습니다.');
        }
    });

    /**
     * [이메일 중복 확인]
     */
    checkEmailBtn.addEventListener('click', async () => {
        const checkEmailInput = document.querySelector('#signupForm input[name="email"]');

        console.log('checkEmailInput :: ', checkEmailInput.value);

        // if (!isValidEmail(checkEmailInput.value)) {
        //     checkEmailInput.focus();
        //     checkEmailInput.select();
        //     return showAlert('유효한 이메일 주소를 입력해주세요.');
        // }

        try {
            const params = new URLSearchParams({ email: checkEmailInput.value });
            const response = await fetch(`/check-email?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': getCsrfToken()
                }
            });

            // 서버에서 온 JSON 데이터를 먼저 받습니다. (400 에러라도 body에 메시지가 있음)
            const data = await response.json();
            
            if (!response.ok) {
                isEmailChecked = false;
                const errorMsg = Array.isArray(result.errors)
                    ? result.errors[0].msg
                    : (result.errors?.msg || '로그인에 실패했습니다.');
                showAlert(errorMsg);
            } else {
                // 성공 시 메인 페이지로 이동
                // window.location.href = '/';
                 showAlert(data.message);
            }




            // if (!response.ok) {
            //     isEmailChecked = false;
            //     showAlert(data.message || '이메일이 존재하지 않습니다.');
            // } else {
            //     // 성공 시 메인 페이지로 이동
            //     // window.location.href = '/';
            //      showAlert(data.message);
            // }

            if (data.isAvailable) {
                showAlert('사용 가능한 이메일입니다.');
                isEmailChecked = true;
                signupSubmitBtn.disabled = false;
                signupSubmitBtn.style.opacity = "1";
                signupSubmitBtn.style.cursor = "pointer";
                // checkEmailInput.readOnly = true;
            } else {
                isEmailChecked = false;
                showAlert(data.message || '이미 1사용 중인 이메일입니다.');
            }

        } catch(err) {
            console.error(err);
            isEmailChecked = false;
            showAlert('중복 확인 중 오류가 발생했습니다.');
        }

        // try {
        //     const response = await axios.get('/auth/check-email', { params: { email: signupEmailInput.value } });
            
        //     if (response.data.isAvailable) {
        //         showAlert('사용 가능한 이메일입니다.');

        //         isEmailChecked = true; 
        //         // 회원가입 버튼 활성화
        //         signupSubmitBtn.disabled = false;
        //         signupSubmitBtn.style.opacity = "1";
        //         signupSubmitBtn.style.cursor = "pointer";
        //         signupEmailInput.readOnly = true; // 확인된 이메일은 수정 불가하게 설정
        //     } else {
        //         isEmailChecked = false; // 중복인 경우 false
        //         showAlert(response.data.message || '이미 사용 중인 이메일입니다.');
        //     }
        // } catch (err) {
        //     isEmailChecked = false; // 중복인 경우 false
        //     showAlert('중복 확인 중 오류가 발생했습니다.');
        // }
    });

    // 이메일 입력 도중 값이 바뀌면 다시 버튼 비활성화
    document.querySelector('#signupForm input[name="email"]').addEventListener('input', () => {
        signupSubmitBtn.disabled = true;
        signupSubmitBtn.style.opacity = "0.5";
        signupSubmitBtn.style.cursor = "not-allowed";
    });

    /**
     * [회원가입 처리]
     */
    document.getElementById('signupForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!isEmailChecked) {
            // 이메일 중복 확인이 완료되지 않은 경우
            return showAlert('이메일 중복 확인이 필요합니다.');
        }

        const emailInput = this.querySelector('input[name="email"]');
        const passwordInput = this.querySelector('input[name="password"]');
        const repasswordInput = this.querySelector('input[name="repassword"]');
        
        // 체크박스 데이터 수집 (강아지/고양이)
        const petTypes = Array.from(this.querySelectorAll('input[name="petType"]:checked'))
                            .map(cb => cb.value);

        if (!checkPasswordSecurity(passwordInput.value)) {
            passwordInput.focus();
            passwordInput.select();
            return showAlert('비밀번호는 6~20자이며, 특수문자를 포함해야 합니다.');
        }

        if (passwordInput.value !== repasswordInput.value) {
            repasswordInput.focus();
            repasswordInput.select();
            return showAlert('비밀번호가 서로 일치하지 않습니다.');
        }

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': getCsrfToken() // 기존에 정의하신 CSRF 토큰 함수 활용
                },
                body: JSON.stringify({
                    email: emailInput.value,
                    password: passwordInput.value,
                    petType: petTypes // 배열 형태 그대로 전달 (MySQL SET 타입 대응)
                })
            });

            // 응답 데이터 파싱
            const result = await response.json();

            if (!response.ok) {
                // 4xx, 5xx 에러 발생 시 서버가 보낸 메시지 활용
                // result.errors가 배열인지 객체인지에 따라 유연하게 처리
                const msg = Array.isArray(result.errors) 
                            ? result.errors[0].msg 
                            : (result.message || '회원가입에 실패했습니다.');
                throw new Error(msg);
            }

            // 성공 처리
            showAlert('회원가입 성공! 로그인 해주세요.');
            setTimeout(() => {
                location.reload();
            }, 2000);

            } catch (err) {
                // throw new Error(msg)에서 던진 메시지 또는 통신 에러 메시지 출력
                showAlert(err.message || '서버와 통신 중 오류가 발생했습니다.');
            }
    });

});

